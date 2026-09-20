import AboutIntro from "@/components/AboutIntro";
import AboutProcess from "@/components/AboutProcess";
import AboutTeam from "@/components/AboutTeam";
import Customers from "@/components/Customers";
import Hero from "@/components/Hero";
import LatestNews from "@/components/LatestNews";
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

      <section
        id="about"
        className="bg-background px-6 py-24 sm:px-10 lg:px-[6.5vw]"
      >
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          {home.about.eyebrow}
        </p>
        <h2 className="mt-4 max-w-3xl font-display text-3xl leading-tight font-light text-steel-900 sm:text-4xl">
          {home.about.title}
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-steel-800">
          {home.about.body}
        </p>
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

      <LatestNews />
    </main>
  );
}
