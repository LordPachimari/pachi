"use client"
import type { PublishedProduct } from "@pachi/db";
import Grid from "~/components/atoms/grid";
import ProductGridItems from "~/components/templates/layouts/product-grid-items";

export function Products() {
  const products: PublishedProduct[] = [
    {
      id: "m1e",
      title: "me",
      created_at: "2023-11-21T12:34:56Z",
      version: 0,
      discountable: true,
      store_id: "m1e",
      description: "dadwwad",
      handle: "dadwad",
      images: [],
      options: [],
      variants: [],
      prices: [
        {
          id: "adwd",
          currency_code: "USD",
          amount: 100,
          variant_id: "m1e",
        },
      ],
      status: "published",
      thumbnail: {
        id: "awdwa",
        url: "https://utfs.io/f/86f71c61-ea84-4de2-be71-ffa98c17f140-130p7e.png",
        name: "dawdaw",
        order: 1,
      },
    },
  ];
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