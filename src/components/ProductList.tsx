"use client";

import ProductBand from "@/components/ProductBand";
import { useDraft } from "@/lib/admin/draft";
import type { Product } from "@/lib/products";

/**
 * The product bands, in order. A component of its own so a signed-in admin's
 * draft — a product added, moved or deleted — shows before it is saved.
 */
export default function ProductList({ items }: { items: Product[] }) {
  const products = useDraft("products.items", items);
  return products.map((product, i) => (
    <ProductBand
      key={product.id}
      product={product}
      index={i}
      divider={i > 0}
    />
  ));
}
