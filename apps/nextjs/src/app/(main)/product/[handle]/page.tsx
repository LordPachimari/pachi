import type { PublishedProduct } from "@pachi/db";

import { Gallery } from "./_components/gallery";
import { ProductDescription } from "./_components/product-description";

export const runtime = "edge";

// export async function generateMetadata({
//   params,
// }: {
//   params: { handle: string };
// }): Promise<Metadata> {
//   const product = await getProduct(params.handle);

//   if (!product) return notFound();

//   const {
//     url,
//     width = 500,
//     height = 500,
//     altText: alt,
//   } = product.featuredImage || {};
//   const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG);

//   return {
//     title: product.title,
//     description: product.description!,
//     robots: {
//       index: indexable,
//       follow: indexable,
//       googleBot: {
//         index: indexable,
//         follow: indexable,
//       },
//     },
//     openGraph: url
//       ? {
//           images: [
//             {
//               url,
//               width,
//               height,
//               alt,
//             },
//           ],
//         }
//       : null,
//   };
// }

export default function ProductPage({
  params,
}: {
  params: { handle: string };
}) {
  // const product = await getProduct(params.handle);
  const product: PublishedProduct = {
    id: "m1e",
    title: "me",
    created_at: "2023-11-21T12:34:56Z",
    version: 0,
    discountable: true,
    store_id: "m1e",
    description: "dadwwad",
    handle: "dadwad",
    images: [
      {
        id: "awdwa",
        url: "https://utfs.io/f/86f71c61-ea84-4de2-be71-ffa98c17f140-130p7e.png",
        name: "dawdaw",
        order: 1,
      },
    ],
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
  };

  // if (!product) return notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.thumbnail.url,
    offers: {
      "@type": "AggregateOffer",
      availability: product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceCurrency: product.prices[0]!.currency_code,
      price: product.prices[0]!.amount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <div className="mx-auto my-10 w-full max-w-screen-2xl px-4">
        <div className="flex w-full flex-col rounded-2xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-black md:p-12 lg:flex-row">
          <div className="h-full w-full basis-full lg:basis-4/6">
            <Gallery
              images={product.images!.map((image) => ({
                src: image.url,
                altText: image.name,
              }))}
            />
          </div>

          <div className="basis-full p-4 lg:basis-2/6">
            <ProductDescription product={product} />
          </div>
        </div>
        {/* <Suspense>
          <RelatedProducts id={product.id!} />
        </Suspense> */}
      </div>
    </>
  );
}
