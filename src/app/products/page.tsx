import type { Metadata } from "next";
import ProductBand from "@/components/ProductBand";
import { products, productsIntro } from "@/lib/products";

export const metadata: Metadata = {
  title: "Products — Metal Coatings (India) Ltd",
  description:
    "MCIL makes two products: cold rolled steel strips and coils, and hot rolled pickled and oiled (HRPO) coils, both rolled and certified at Faridabad.",
};

export default function ProductsPage() {
  return (
    <main className="bg-background">
      {/* Compact page head. The bands themselves open on the product name, as
          the reference does, so this stays out of their way. */}
      <section className="px-6 pt-32 pb-4 sm:px-10 lg:px-[6.5vw] lg:pt-40">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-accent uppercase">
            [ {productsIntro.eyebrow} ]
          </p>
          <h1 className="type-display mt-5 max-w-3xl text-[clamp(1.9rem,5.2vw,3.6rem)] leading-[1.12] text-steel-900 uppercase">
            {productsIntro.title}
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-steel-800 sm:text-base">
            {productsIntro.standfirst}
          </p>
        </div>
      </section>

      {products.map((product, i) => (
        <ProductBand key={product.id} product={product} divider={i > 0} />
      ))}
    </main>
  );
}
