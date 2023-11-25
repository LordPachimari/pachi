import type { Product, PublishedProduct, Store } from "@pachi/db";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/atoms/avatar";
import { Card, CardContent } from "~/components/atoms/card";
import Grid from "~/components/atoms/grid";
import ProductGridItems from "~/components/templates/layouts/product-grid-items";

export default function StorePage({
  params,
}: {
  params: {
    name: string;
  };
}) {
  const name = params.name;
  const store: Store = {
    id: "m1e",
    name: "me",
    created_at: "2023-11-21T12:34:56Z",
    founder_id: "m1e",
    version: 0,
  };
  return (
    <section className="relative">
      <StoreCard store={store} />
      <div className="h-[400px] w-full bg-red-300"></div>
      <div className="w-full p-4 md:p-10">
        <Products />
      </div>
    </section>
  );
}
function StoreCard({ store }: { store: Store }) {
  return (
    <Card className="absolute left-1/2 top-10 flex min-h-[300px] w-full -translate-x-1/2 transform items-center justify-center rounded-2xl p-6 md:w-[600px]">
      <div className="flex h-full w-full">
        <section className="flex w-[200px] items-center justify-center">
          <Avatar className="h-52 w-52">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </section>
        <section className="">
          <h1>Username</h1>
          <h2>Bla bla bla</h2>
        </section>
      </div>
    </Card>
  );
}
function Products() {
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
