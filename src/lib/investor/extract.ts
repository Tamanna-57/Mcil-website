/**
 * Reads a year's figures out of an annual report's text.
 *
 * This is deliberate, deterministic label matching — find "Revenue from
 * operations", take the first number on that line — and it is the weak link in
 * the import. An annual report is a designed document, not a data feed: a
 * table split across two columns, a label reworded, a figure set in a graphic
 * rather than as text, and the match is wrong or missing. Nothing here is
 * clever enough to notice that on its own.
 *
 * So every field comes back with the line it was read from and how confident
 * the match is, and the import flow shows both to a person before anything is
 * published. A missing field is reported as missing and typed in by hand; a
 * field read from a weak label match is flagged for checking. The parser is
 * allowed to fail — it is not allowed to fail quietly.
 */

export type FieldKey =
  | "revenue"
  | "ebitda"
  | "pat"
  | "eps"
  | "dividendPerShare";

/** The unit a report states its tables in. Per-share figures never scale. */
export type Unit = "lakh" | "crore" | "million" | "thousand" | "rupee";

/** How many rupees one unit is worth, as a multiple of ₹1 crore. */
const CRORE_PER_UNIT: Record<Unit, number> = {
  crore: 1,
  lakh: 0.01,
  million: 0.1,
  thousand: 0.0001,
  rupee: 0.0000001,
};

export type Candidate = {
  /** The figure as printed in the report, before any unit conversion. */
  raw: number;
  /** ₹ crore for money; unchanged for per-share amounts. */
  value: number;
  /** The line the figure was read from, shown to the reviewer verbatim. */
  snippet: string;
  /**
   * "high" when the report used the exact label we look for, "low" when a
   * looser wording matched and the figure should be checked against the PDF.
   */
  confidence: "high" | "low";
};

export type Extraction = {
  /** The financial year the report covers — 2027 for FY 2026-27. */
  fy: number | null;
  fySnippet?: string;
  /** The unit the money tables are stated in. */
  unit: Unit;
  unitSnippet?: string;
  /** Whether the unit was actually found or fell back to the default. */
  unitFound: boolean;
  fields: Partial<Record<FieldKey, Candidate>>;
  /** Fields no label matched. These are typed in by hand. */
  missing: FieldKey[];
  pageCount: number;
};

/* ------------------------------------------------------------------ numbers */

/**
 * A figure as Indian financial statements print it: grouped in lakhs
 * ("1,50,20.40") or thousands ("15,520.40"), and negative in parentheses.
 */
const NUMBER = /\(?\s*(-?\d{1,3}(?:,\d{2,3})*(?:\.\d+)?|-?\d+(?:\.\d+)?)\s*\)?/g;

function parseNumber(token: string, negated: boolean): number {
  const n = Number(token.replace(/,/g, ""));
  if (!Number.isFinite(n)) return NaN;
  return negated ? -Math.abs(n) : n;
}

type Figure = { value: number; hasDecimal: boolean };

/**
 * The figures on a line, left to right, with the note-reference column removed.
 *
 * Statements print the year under review first and the comparative after it,
 * so callers take the first of what comes back. Two things sit between the
 * label and the figures and would otherwise be read as the answer:
 *
 *  - a four-digit year, dropped outright;
 *  - the note-reference column — "Revenue from operations  18  155.20  148.98"
 *    — where 18 points at note 18. A note reference is a bare integer standing
 *    in front of figures that carry decimals, or one an order of magnitude
 *    smaller than everything after it, and only ever the first token.
 */
function figuresOn(line: string): Figure[] {
  const out: Figure[] = [];
  NUMBER.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = NUMBER.exec(line)) !== null) {
    const whole = m[0];
    const token = m[1];
    const negated = whole.includes("(") && whole.includes(")");
    const value = parseNumber(token, negated);
    if (Number.isNaN(value)) continue;

    /* "2026-27", "31.03.2027", "FY2027" — a year, not a figure. */
    if (/^\d{4}$/.test(token) && value >= 1900 && value <= 2200) continue;

    out.push({ value, hasDecimal: token.includes(".") });
  }

  return dropNoteReference(out);
}

function dropNoteReference(figures: Figure[]): Figure[] {
  if (figures.length < 2) return figures;

  const [first, ...rest] = figures;
  if (first.hasDecimal) return figures;

  const looksLikeNote =
    /* Bare integer in front of figures printed to the paisa. */
    rest.some((f) => f.hasDecimal) ||
    /* Or a small integer dwarfed by the figures after it. */
    (Math.abs(first.value) < 100 &&
      Math.abs(rest[0].value) >= Math.abs(first.value) * 10);

  return looksLikeNote ? rest : figures;
}

/* ------------------------------------------------------------------- labels */

type Matcher = { re: RegExp; confidence: "high" | "low" };

/**
 * What each figure is called, best wording first.
 *
 * "high" is the phrasing prescribed by Schedule III of the Companies Act,
 * which is what a filed statement uses. "low" covers the summary tables and
 * the directors' report, where the wording is the company's own.
 */
const LABELS: Record<FieldKey, Matcher[]> = {
  revenue: [
    { re: /revenue\s+from\s+operations?\b/i, confidence: "high" },
    { re: /\bnet\s+(?:sales|revenue)\b/i, confidence: "low" },
    { re: /\bturnover\b/i, confidence: "low" },
    { re: /\btotal\s+revenue\b/i, confidence: "low" },
  ],
  ebitda: [
    { re: /\bEBITDA\b/i, confidence: "high" },
    {
      re: /earnings?\s+before\s+interest[\s,]+tax/i,
      confidence: "high",
    },
    {
      re: /operating\s+profit\b/i,
      confidence: "low",
    },
  ],
  pat: [
    {
      re: /profit\s*(?:\/\s*\(?\s*loss\s*\)?\s*)?\s+after\s+tax\b/i,
      confidence: "high",
    },
    { re: /profit\s+for\s+the\s+(?:year|period)\b/i, confidence: "high" },
    { re: /\bnet\s+profit\b/i, confidence: "low" },
    { re: /profit\s+after\s+taxation\b/i, confidence: "low" },
  ],
  eps: [
    { re: /earnings?\s+per\s+(?:equity\s+)?share\b/i, confidence: "high" },
    { re: /\bEPS\b/i, confidence: "low" },
    { re: /\bbasic\s+(?:and\s+diluted\s+)?(?:EPS|earnings)\b/i, confidence: "low" },
  ],
  /* Handled separately — the dividend is stated in a sentence, not a table. */
  dividendPerShare: [],
};

/** Lines that name a figure but never carry it, e.g. a table of contents. */
const NOISE = /(?:table\s+of\s+contents|\.{4,}|page\s+\d+\s*$)/i;

type FindOptions = {
  /** Every figure must be acceptable on its own terms. */
  accept: (figure: Figure) => boolean;
  /**
   * How many lines past the label to keep looking when the label's own line
   * carries no figure. "Earnings per equity share" is routinely a heading with
   * "Basic" and "Diluted" indented underneath it, each with its own figure.
   */
  lookahead?: number;
  /** Within the lookahead, a line matching this is taken first. */
  prefer?: RegExp;
};

/**
 * Pick the best line for a field.
 *
 * A high-confidence label wins outright. Within one confidence level the first
 * line carrying a usable figure wins, which is what puts the financial
 * highlights table ahead of the same wording repeated in the notes.
 */
function findField(
  lines: string[],
  matchers: Matcher[],
  options: FindOptions,
): Candidate | undefined {
  const { accept, lookahead = 0, prefer } = options;
  let fallback: Candidate | undefined;

  /** The first acceptable figure at or after `index`, within the window. */
  const readFrom = (
    index: number,
    labelEnd: number,
  ): { figure: Figure; line: string } | undefined => {
    const last = Math.min(index + lookahead, lines.length - 1);
    const window: { line: string; text: string }[] = [];

    for (let i = index; i <= last; i += 1) {
      /* On the label's own line, only look after the label — a figure before
         it belongs to another row that ran into this one when the page was
         flattened. */
      const text = i === index ? lines[i].slice(labelEnd) : lines[i];
      if (i !== index && NOISE.test(lines[i])) continue;
      window.push({ line: lines[i], text });
    }

    /* A preferred line ("Basic") beats mere proximity. */
    if (prefer) {
      for (const entry of window) {
        if (!prefer.test(entry.line)) continue;
        const figure = figuresOn(entry.text).find(accept);
        if (figure) return { figure, line: entry.line };
      }
    }

    for (const entry of window) {
      const figure = figuresOn(entry.text).find(accept);
      if (figure) return { figure, line: entry.line };
    }
    return undefined;
  };

  for (const { re, confidence } of matchers) {
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (NOISE.test(line)) continue;
      const hit = re.exec(line);
      if (!hit) continue;

      const found = readFrom(i, hit.index + hit[0].length);
      if (!found) continue;

      const candidate: Candidate = {
        raw: found.figure.value,
        value: found.figure.value,
        snippet: found.line.trim().replace(/\s+/g, " ").slice(0, 200),
        confidence,
      };
      if (confidence === "high") return candidate;
      fallback ??= candidate;
    }
  }

  return fallback;
}

/* --------------------------------------------------------------------- unit */

const UNIT_PATTERNS: { re: RegExp; unit: Unit }[] = [
  { re: /\bin\s+(?:₹|rs\.?|rupees?)?\s*lakh?s?\b/i, unit: "lakh" },
  { re: /(?:₹|rs\.?|rupees?)[^\n]{0,12}\bin\s+lakh?s?\b/i, unit: "lakh" },
  { re: /\bin\s+(?:₹|rs\.?|rupees?)?\s*cr(?:ore)?s?\b/i, unit: "crore" },
  { re: /(?:₹|rs\.?|rupees?)[^\n]{0,12}\bin\s+cr(?:ore)?s?\b/i, unit: "crore" },
  { re: /\bin\s+(?:₹|rs\.?|rupees?)?\s*millions?\b/i, unit: "million" },
  { re: /\bin\s+(?:₹|rs\.?|rupees?)?\s*(?:thousands?|'000)\b/i, unit: "thousand" },
];

function findUnit(lines: string[]): { unit: Unit; snippet?: string } | null {
  for (const line of lines) {
    for (const { re, unit } of UNIT_PATTERNS) {
      if (re.test(line)) {
        return { unit, snippet: line.trim().replace(/\s+/g, " ").slice(0, 160) };
      }
    }
  }
  return null;
}

/* ------------------------------------------------------- financial year end */

/**
 * The year the report covers.
 *
 * "31st March, 2027" and "2026-27" both mean FY 2026-27, which this calls
 * 2027 — the year it ends in, matching `FinancialYear.fy`.
 */
function findFinancialYear(
  lines: string[],
): { fy: number; snippet: string } | null {
  const patterns: RegExp[] = [
    /(?:year\s+end(?:ed|ing)|as\s+at)\s+(?:31\s*(?:st)?\s*(?:day\s+of\s+)?)?(?:march|mar\.?|03[./-])[\s,.]*(\d{4})/i,
    /31[./-]0?3[./-](\d{4})/,
    /\b(?:F\.?Y\.?|financial\s+year)\s*:?\s*(\d{4})\s*[-–—/]\s*(\d{2,4})\b/i,
    /\b(\d{4})\s*[-–—]\s*(\d{2})\b/,
  ];

  for (const re of patterns) {
    for (const line of lines) {
      const hit = re.exec(line);
      if (!hit) continue;

      let fy: number;
      if (hit[2] !== undefined) {
        /* "2026-27" -> 2027; "2026-2027" -> 2027. */
        const start = Number(hit[1]);
        const tail = Number(hit[2]);
        fy = hit[2].length === 4 ? tail : Math.floor(start / 100) * 100 + tail;
        /* "1999-00" rolls into the next century. */
        if (fy < start) fy += 100;
      } else {
        fy = Number(hit[1]);
      }

      if (fy >= 1990 && fy <= 2200) {
        return {
          fy,
          snippet: line.trim().replace(/\s+/g, " ").slice(0, 160),
        };
      }
    }
  }
  return null;
}

/* ----------------------------------------------------------------- dividend */

/**
 * The dividend per share, which is recommended in a sentence rather than
 * tabulated: "a dividend of ₹1.00 per equity share of face value ₹10 each".
 *
 * The face-value amount in the same sentence is the trap, so the figure is
 * read from immediately before "per ... share" rather than from the line.
 */
const DIVIDEND_PATTERNS: Matcher[] = [
  {
    re: /dividend\s+of\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:\/-)?\s*(?:per|on\s+each)\s+(?:equity\s+|ordinary\s+)?share/i,
    confidence: "high",
  },
  {
    re: /(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)\s*(?:\/-)?\s*per\s+(?:equity\s+|ordinary\s+)?share/i,
    confidence: "high",
  },
  {
    re: /dividend[^\n]{0,60}?(\d+(?:\.\d+)?)\s*%\s*(?:on\s+)?(?:the\s+)?(?:paid[- ]up\s+)?(?:face\s+value|equity)/i,
    confidence: "low",
  },
];

function findDividend(
  lines: string[],
  faceValue: number,
): Candidate | undefined {
  for (const { re, confidence } of DIVIDEND_PATTERNS) {
    for (const line of lines) {
      if (/no\s+dividend|not\s+recommend/i.test(line)) continue;
      const hit = re.exec(line);
      if (!hit) continue;
      const printed = Number(hit[1]);
      if (!Number.isFinite(printed) || printed < 0) continue;

      /* A percentage of face value, e.g. "10% on face value" -> ₹1.00. */
      const isPercent = /%/.test(hit[0]);
      const value = isPercent ? (printed / 100) * faceValue : printed;
      if (value > faceValue * 10) continue;

      return {
        raw: printed,
        value,
        snippet: line.trim().replace(/\s+/g, " ").slice(0, 200),
        confidence,
      };
    }
  }
  return undefined;
}

/* ------------------------------------------------------------------- public */

export type ExtractOptions = {
  /** Face value of one equity share, for a dividend stated as a percentage. */
  faceValue?: number;
  /** Used when the report states no unit. Indian reports are almost all lakh. */
  fallbackUnit?: Unit;
};

export function extractFigures(
  text: string,
  pageCount: number,
  options: ExtractOptions = {},
): Extraction {
  const faceValue = options.faceValue ?? 10;
  const fallbackUnit = options.fallbackUnit ?? "lakh";

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/ /g, " ").trimEnd())
    .filter((l) => l.trim().length > 0);

  const year = findFinancialYear(lines);
  const foundUnit = findUnit(lines);
  const unit = foundUnit?.unit ?? fallbackUnit;
  const scale = CRORE_PER_UNIT[unit];

  const fields: Partial<Record<FieldKey, Candidate>> = {};

  /* Money figures. A statement never prints a bare zero for revenue, so
     rejecting zero skips the "—" placeholder rows without losing a real one. */
  const money = (key: Exclude<FieldKey, "eps" | "dividendPerShare">) => {
    const hit = findField(lines, LABELS[key], {
      accept: (f) => f.value !== 0,
      lookahead: 1,
    });
    if (!hit) return;
    fields[key] = { ...hit, value: hit.raw * scale };
  };

  money("revenue");
  money("ebitda");
  money("pat");

  /*
   * EPS is already per share: it is not scaled, and it is small. It is also
   * always printed to the paisa, and that is what tells a real EPS from the
   * note reference beside the heading — so a figure without a decimal point is
   * not an EPS, and the "Basic" line below the heading is where to look.
   */
  const eps = findField(lines, LABELS.eps, {
    accept: (f) => f.hasDecimal && f.value !== 0 && Math.abs(f.value) < 1000,
    lookahead: 3,
    prefer: /\bbasic\b/i,
  });
  if (eps) fields.eps = eps;

  const dividend = findDividend(lines, faceValue);
  if (dividend) fields.dividendPerShare = dividend;

  const order: FieldKey[] = [
    "revenue",
    "ebitda",
    "pat",
    "eps",
    "dividendPerShare",
  ];

  return {
    fy: year?.fy ?? null,
    ...(year ? { fySnippet: year.snippet } : {}),
    unit,
    ...(foundUnit?.snippet ? { unitSnippet: foundUnit.snippet } : {}),
    unitFound: foundUnit !== null,
    fields,
    missing: order.filter((k) => !fields[k]),
    pageCount,
  };
}

/** Human label for each field, shared by the API and the review form. */
export const FIELD_LABELS: Record<FieldKey, string> = {
  revenue: "Revenue from operations",
  ebitda: "EBITDA",
  pat: "Profit after tax",
  eps: "Earnings per share",
  dividendPerShare: "Dividend per share",
};

/** Which fields are money in the report's unit, and which are per share. */
export const PER_SHARE_FIELDS: ReadonlySet<FieldKey> = new Set([
  "eps",
  "dividendPerShare",
]);
