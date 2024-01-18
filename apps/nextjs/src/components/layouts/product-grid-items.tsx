import Link from "next/link";

import type { PublishedProduct } from "@pachi/db";

import { GridTileImage } from "~/components/molecules/grid-tile-image";
import Grid from "~/components/ui/grid";

export default function ProductGridItems({
  products,
}: {
  products: PublishedProduct[];
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
                amount: product.prices[0]!.amount,
                currencyCode: product.prices[0]!.currencyCode,
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
