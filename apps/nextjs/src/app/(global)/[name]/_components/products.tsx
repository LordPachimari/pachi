"use client";

import type { Client } from "@pachi/validators";

import ProductGridItems from "~/app/(global)/[name]/_components/product-grid-items";
import Grid from "~/components/ui/grid";

export function Products() {
  const products: Client.PublishedProduct[] = [];

  if (products.length === 0)
    return (
      <p className="py-3 text-lg">{`No products found in this collection`}</p>
    );

  return (
    <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <ProductGridItems products={products} />
    </Grid>
  );
}
