import Hero from "@/components/Hero";
import LatestNews from "@/components/LatestNews";
import SiteIntro from "@/components/SiteIntro";
import { getContent } from "@/lib/content/store";

/* Copy comes from the content store, which the admin panel writes to, so the
   page is rendered per request rather than baked at build time. */
export const dynamic = "force-dynamic";

export default async function Home() {
  const { home } = await getContent();

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

      <LatestNews />
    </main>
  );
}
