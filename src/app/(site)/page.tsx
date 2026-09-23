import AboutIntro from "@/components/AboutIntro";
import AboutProcess from "@/components/AboutProcess";
import AboutTeam from "@/components/AboutTeam";
import Customers from "@/components/Customers";
import Hero from "@/components/Hero";
import SiteIntro from "@/components/SiteIntro";
import { getContent } from "@/lib/content/store";

/* Copy comes from the content store, which the admin panel writes to, so the
   page is rendered per request rather than baked at build time. */
export const dynamic = "force-dynamic";

/**
 * The landing page, which is now the whole of the company's own story.
 *
 * About Us used to be a page of its own; it has been folded in here, in the
 * order the sections are listed below, and /about redirects to this page (see
 * `next.config.ts`) so the anchors the navigation already points at still
 * land. What the About page carried and this does not is its own page hero —
 * the landing hero already opens the page — and its closing "talk to us"
 * panel, which the footer's contact details cover.
 *
 * The About sections still read from `content.about`, so the admin panel's
 * About tab edits them exactly as before.
 */
export default async function Home() {
  const { home, about } = await getContent();

  return (
    <main>
      <SiteIntro />

      <Hero slides={home.hero.slides} standfirst={home.hero.standfirst} />

      {/*
        The about band: the title set large down the left, and the copy to the
        right of it — a bold lead line across the top, then the paragraphs
        flowed into two columns beneath.

        The columns are CSS multi-column rather than a grid, so the text fills
        and balances itself however many paragraphs the admin panel saves. They
        collapse to one column below `sm`, where two would be a few words wide.
      */}
      <section
        id="about"
        className="bg-background px-6 pt-20 pb-12 sm:px-10 lg:px-[6.5vw] lg:pt-24 lg:pb-10"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.46fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-accent uppercase">
              [ {home.about.eyebrow} ]
            </p>
            {/* One line at every width: tracked tighter than `type-display`
                sets it, and held from wrapping — the clamp keeps it inside the
                column rather than the wrap doing it. */}
            <h2 className="type-display mt-5 text-[clamp(2.4rem,6vw,4.2rem)] leading-[1] tracking-[0.01em] whitespace-nowrap text-steel-900">
              {home.about.title}
            </h2>
          </div>

          <div>
            <p className="max-w-2xl font-display text-lg leading-snug font-semibold text-steel-900 sm:text-xl">
              {home.about.lead}
            </p>

            <div className="mt-8 text-[15px] leading-relaxed text-steel-800 sm:columns-2 sm:gap-10 sm:text-base lg:mt-10">
              {home.about.body
                .split(/\n\s*\n/)
                .map((paragraph) => paragraph.trim())
                .filter(Boolean)
                .map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 32)}
                    className="mb-5 break-inside-avoid last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>
        </div>
      </section>

      <AboutProcess
        eyebrow={about.process.eyebrow}
        title={about.process.title}
        steps={about.process.steps}
      />

      <Customers
        eyebrow={home.customers.eyebrow}
        title={home.customers.title}
        standfirst={home.customers.standfirst}
        footnote={home.customers.footnote}
        items={home.customers.items}
      />

      <AboutIntro
        eyebrow={about.advantage.eyebrow}
        title={about.advantage.title}
        standfirst={about.advantage.standfirst}
        points={about.advantage.points}
        image={about.advantage.image}
        alt={about.advantage.alt}
        badgeLabel={about.advantage.badgeLabel}
        badgeText={about.advantage.badgeText}
      />

      <AboutTeam
        heading={about.team.heading}
        members={about.team.members}
        footnote={about.team.footnote}
      />

    </main>
  );
}
