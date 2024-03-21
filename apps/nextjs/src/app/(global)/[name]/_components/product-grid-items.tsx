import Link from "next/link";

import type { Client } from "@pachi/validators";

import Grid from "~/components/ui/grid";
import { GridTileImage } from "./tile";

export default function ProductGridItems({
  products,
}: {
  products: Client.PublishedProduct[];
}) {
  return (
    <>
      {products.map((product) => (
        <Grid.Item key={product.handle} className="animate-fadeIn">
          <Link
            className="relative inline-block h-full w-full"
            href={`/product/${product.handle}`}
          >
            <GridTileImage
              alt={product.title}
              label={{
                title: product.title,
                amount: 12,
                currencyCode: "USD",
                position: "bottom",
              }}
              src={product.thumbnail.url}
              fill
              sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </Link>
        </Grid.Item>
      ))}
    </>
  );
}
