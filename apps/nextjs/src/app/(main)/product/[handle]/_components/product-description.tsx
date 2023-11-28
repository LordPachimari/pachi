import type { PublishedProduct } from "@pachi/db";

import Price from "~/components/molecules/price";
import Prose from "~/components/other/prose";
import { VariantSelector } from "./variant-selector";

export function ProductDescription({ product }: { product: PublishedProduct }) {
  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
        <h1 className="mb-2 text-5xl font-medium">{product.title}</h1>
        <div className="mr-auto w-auto rounded-full bg-brand p-2 text-sm text-white">
          <Price
            amount={product.prices[0]!.amount}
            currencyCode={product.prices[0]!.currency_code}
          />
        </div>
      </div>
      <VariantSelector options={product.options} variants={product.variants} />

      {product.description ? (
        <Prose
          className="mb-6 text-sm leading-tight dark:text-white/[60%]"
          html={product.description}
        />
      ) : null}

      {/* <AddToCart
        variants={product.variants}
        availableForSale={product.availableForSale}
      /> */}
    </>
  );
}
