"""
Turn the index of the old mcil.net investor section into what the new site
and the bucket need.

    python3 tools/old-reports/build.py

Reads  old-site-index.json   every row on the old site: its category and
                             sub-category ids there, title, link and a date
                             (worked out from the title, the file name, or the
                             upload stamp the old site put on each file name)
Writes src/lib/investor-report-docs.json   the rows, keyed by our sub-category id
       tools/old-reports/copy-to-bucket.sh the Cloud Shell script
       tools/old-reports/CHECK-BY-HAND.md  rows whose date or file needs a person

Re-running it is safe; the outputs are regenerated whole.
"""

import json
import re
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent.parent

# Old site "catid-subcatid" -> our sub-category id in src/lib/investor-reports.ts
SUBCATS = {
    "16-95": "annual-audited",
    "16-93": "unaudited",
    "18-85": "investor-forms",
    "18-70": "unclaimed-dividend",
    "18-53": "code",
    "18-52": "policies-list",
    "19-101": "integrated-filing",
    "19-100": "compliance-others",
    "19-91": "secretarial-compliance",
    "19-87": "sast",
    "19-78": "familiarisation",
    "19-76": "credit-ratings",
    "19-75": "committee-of-directors",
    "19-73": "shareholder-information",
    "19-68": "agm",
    "19-60": "investor-complaints",
    "19-56": "share-capital-audit",
    "19-55": "corporate-governance",
    "19-54": "shareholding-pattern",
    "20-99": "intimation",
    "20-98": "outcome",
    "20-97": "newspaper",
    "20-96": "letters-others",
}

# Where each sub-category sits in the admin panel, for the check-by-hand list.
PLACE = {
    "annual-audited": "Financials → Annual Report & Audited Financial Results",
    "unaudited": "Financials → Unaudited Financial Results",
    "investor-forms": "Policies → Investor Forms",
    "unclaimed-dividend": "Policies → Unclaimed Dividend",
    "code": "Policies → Code",
    "policies-list": "Policies → Policies",
    "integrated-filing": "Compliance → Integrated Filing Report",
    "compliance-others": "Compliance → Others",
    "secretarial-compliance": "Compliance → Secretarial Compliance Report",
    "sast": "Compliance → SAST",
    "familiarisation": "Compliance → Familiarisation Programme",
    "credit-ratings": "Compliance → Credit Ratings",
    "committee-of-directors": "Compliance → Committee of Directors",
    "shareholder-information": "Compliance → Shareholder Information",
    "agm": "Compliance → AGM",
    "investor-complaints": "Compliance → Investors Complaint Report",
    "share-capital-audit": "Compliance → Reconciliation of Share Capital Audit Report",
    "corporate-governance": "Compliance → Corporate Governance Report",
    "shareholding-pattern": "Compliance → Shareholding Pattern",
    "intimation": "Letters → Intimation",
    "outcome": "Letters → Outcome",
    "newspaper": "Letters → Newspaper Publication",
    "letters-others": "Letters → Others",
}

# Keep in step with ARCHIVE_BEFORE in src/lib/investor-reports.ts.
ARCHIVE_BEFORE = "2018-03-01"

DATE = r"\d{1,2}\s*[.\-/]\s*\d{1,2}\s*[.\-/]\s*\d{2,4}"


def clean_title(title: str) -> str:
    t = re.sub(r"\s+", " ", title).strip().rstrip(".")
    # "Results_31.03.2013", "Report - 31.03.2018" -> "Results — 31.03.2013",
    # the way the rows written for the new site read.
    t = re.sub(rf"\s*(?:_|\s-\s|\s–\s|-)\s*(?={DATE}\s*$)", " — ", t)
    t = re.sub(r"\s*[_–-]\s*(?=20\d\d\s*$)", " ", t)  # "Annual Report_2013"
    t = re.sub(r"(\d{1,2})\s*\.\s*(\d{1,2})\s*\.\s*(\d{4})", r"\1.\2.\3", t)
    t = t.replace("_", " ")
    return re.sub(r"\s+", " ", t).strip()


def slug(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:80].rstrip("-") or "document"


HOW = {
    "year": "only a year in the title; date set to 31 Dec of that year",
    "month": "only a month in the title; date set to the 1st",
    "upload?": "taken from the old site's upload stamp, which could be read two ways",
    "none": "no date anywhere",
}


def main():
    rows = json.loads((HERE / "old-site-index.json").read_text())
    docs = defaultdict(list)
    used = defaultdict(set)
    copies = []
    check = []
    missing = []

    # A dead link that sits beside a working copy of the same filing is the
    # old site's leftover, not a second document.
    have = {(r["cat"], r["sub"], clean_title(r["title"])) for r in rows if r["ok"]}
    rows = [
        r for r in rows
        if r["ok"] or (r["cat"], r["sub"], clean_title(r["title"])) not in have
    ]

    for r in rows:
        sub = SUBCATS[f"{r['cat']}-{r['sub']}"]
        title = clean_title(r["title"])
        doc = {"title": title, "date": r["date"] or ""}

        if r["ok"]:
            ext = ".html" if r["url"].lower().endswith(".html") else ".pdf"
            base = slug(title)
            name, n = base, 2
            while name in used[sub]:
                name, n = f"{base}-{n}", n + 1
            used[sub].add(name)
            path = f"{sub}/{name}{ext}"
            doc["href"] = f"/reports/{path}"
            copies.append((path, r["url"]))
        else:
            missing.append((sub, title, r["date"] or "—"))

        if r["how"] in HOW:
            check.append((sub, title, f"{r['date'] or '—'}: {HOW[r['how']]}"))
        docs[sub].append(doc)

    for sub in docs:
        docs[sub].sort(key=lambda d: d["date"], reverse=True)

    ordered = {s: docs.get(s, []) for s in SUBCATS.values()}
    (ROOT / "src/lib/investor-report-docs.json").write_text(
        json.dumps(ordered, indent=1, ensure_ascii=False) + "\n"
    )

    lines = "\n".join(f"{p}\t{u}" for p, u in copies)
    script = (HERE / "copy-to-bucket.template.sh").read_text()
    (HERE / "copy-to-bucket.sh").write_text(
        script.replace("__COUNT__", str(len(copies))).replace("__LIST__", lines)
    )

    md = [
        "# Old reports to check by hand",
        "",
        f"Generated by `build.py`. {len(rows)} rows came over from mcil.net, "
        f"{len(copies)} with a file. Rows dated before {ARCHIVE_BEFORE} show "
        "under **Archives**.",
        "",
        "Fix any of these in the admin panel: **Investors → Reports & filings**, "
        "then the category and sub-category named below.",
        "",
        "## Files missing on the old site too",
        "",
        "These rows are listed on mcil.net, but its link is empty or the server "
        "refuses the file. They show with a greyed-out Download until the PDF is "
        "uploaded.",
        "",
        "| Where | Title | Date |",
        "| --- | --- | --- |",
    ]
    md += [f"| {PLACE[s]} | {t.replace('|', '/')} | {d} |" for s, t, d in missing]
    md += [
        "",
        "## Dates worked out as well as possible",
        "",
        "The date decides the order in the list and whether a row goes to "
        f"Archives (before {ARCHIVE_BEFORE}). Correct it if you know the real "
        "filing date.",
        "",
        "| Where | Title | Date used |",
        "| --- | --- | --- |",
    ]
    md += [f"| {PLACE[s]} | {t.replace('|', '/')} | {w} |" for s, t, w in check]
    (HERE / "CHECK-BY-HAND.md").write_text("\n".join(md) + "\n")

    archived = sum(1 for r in rows if r["date"] and r["date"] < ARCHIVE_BEFORE)
    print(f"{len(rows)} rows, {len(copies)} files, {archived} archived, {len(missing)} missing, {len(check)} dates to check")


if __name__ == "__main__":
    main()
