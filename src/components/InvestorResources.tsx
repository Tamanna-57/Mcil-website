import { company, resourceGroups } from "@/lib/investor-resources";

const keyFacts = [
  { label: "CIN", value: company.cin },
  { label: "BSE Scrip Code", value: company.bseScripCode },
  { label: "Scrip ID", value: company.bseScripId },
  { label: "ISIN", value: company.isin },
];

export default function InvestorResources() {
  return (
    <section
      id="resources"
      className="bg-background px-6 py-20 sm:px-10 lg:px-[6.5vw] lg:py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="text-center">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-accent uppercase">
            [ Disclosures ]
          </p>
          <h2 className="type-display mt-4 text-[clamp(1.6rem,4.6vw,3.1rem)] leading-[1.15] text-steel-900 uppercase">
            Investor Resources
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-steel-800 sm:text-base">
            Everything filed with the exchange, grouped as it is published.
          </p>
        </header>

        {/* Scrip identifiers, the first thing an investor checks. */}
        <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {keyFacts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-2xl bg-surface p-5 ring-1 ring-steel-900/8"
            >
              <dt className="text-[11px] font-semibold tracking-[0.14em] text-steel-800/70 uppercase">
                {fact.label}
              </dt>
              <dd className="mt-2 font-display text-base font-semibold break-all text-steel-900 sm:text-lg">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {resourceGroups.map((group) => (
            <article
              key={group.id}
              className="flex flex-col rounded-2xl bg-surface p-6 ring-1 ring-steel-900/8 sm:p-7"
            >
              <h3 className="font-display text-xl font-semibold text-steel-900">
                {group.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-800">
                {group.note}
              </p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full bg-background px-3 py-1.5 text-xs text-steel-800"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href={group.href}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-fit items-center gap-2 text-[13px] font-semibold text-brand-deep hover:underline"
              >
                Open on mcil.net
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden
                >
                  <path
                    d="M4 1h8v8M12 1 1 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </article>
          ))}
        </div>

        {/* Contacts an investor needs: the company, and its registrar. */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-surface p-6 ring-1 ring-steel-900/8 sm:p-7">
            <h3 className="font-display text-lg font-semibold text-steel-900">
              Company
            </h3>
            <dl className="mt-4 space-y-3 text-sm text-steel-800">
              <Row label="Registered Office" value={company.registeredOffice} />
              <Row label="Works" value={company.works} />
              <Row label="Telephone" value={company.phone} />
              <Row
                label={company.complianceOfficer.role}
                value={company.complianceOfficer.name}
              />
              <div>
                <dt className="text-[11px] tracking-[0.12em] text-steel-800/70 uppercase">
                  Email
                </dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${company.email}`}
                    className="text-brand-deep hover:underline"
                  >
                    {company.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl bg-surface p-6 ring-1 ring-steel-900/8 sm:p-7">
            <h3 className="font-display text-lg font-semibold text-steel-900">
              Registrar & Share Transfer Agent
            </h3>
            <dl className="mt-4 space-y-3 text-sm text-steel-800">
              <Row
                label="Name"
                value={`${company.registrar.name} (${company.registrar.was})`}
              />
              <Row label="Address" value={company.registrar.address} />
              <Row label="Telephone" value={company.registrar.phone} />
              <Row label="BIS Certification" value={company.bisLicence} />
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] tracking-[0.12em] text-steel-800/70 uppercase">
        {label}
      </dt>
      <dd className="mt-1 leading-relaxed">{value}</dd>
    </div>
  );
}
