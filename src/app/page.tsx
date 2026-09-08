import Hero from "@/components/Hero";
import SiteHeader from "@/components/SiteHeader";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />

        {/* Placeholder landing zone for the scroll cue — the rest of the
            revamp lands here. */}
        <section
          id="about"
          className="bg-white px-6 py-24 sm:px-10 lg:px-[6.5vw]"
        >
          <p className="font-display text-xs tracking-[0.2em] text-accent uppercase">
            About MCIL
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl leading-tight font-light text-steel-900 sm:text-4xl">
            A public limited company promoted by the Khandelwal family in
            December 1994, manufacturing cold rolled steel strips, coils and
            HRPO steel.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-steel-900/70">
            MCIL supplies auto components, white goods, electrical equipment and
            power transmission manufacturers, and is BIS certified under
            IS: 513:2008 (Licence no. CM/L-9512364723).
          </p>
        </section>
      </main>
    </>
  );
}
