// import { useRouter } from "next/navigation";
// import omit from "lodash.omit";
// import { ulid } from "ulid";

// import type { Product, ProductOption, ProductVariant } from "@pachi/db";
// import { generateId } from "@pachi/types";
// import { getErrorMessage } from "@pachi/utils";

// import useNotification from "~/dashboard/hooks/use-notification";
// import { ReplicacheInstancesStore } from "~/zustand/rep";

// /**
//  * Utility function to create a new title and handle for a copied product.
//  * This allows the user to duplicate a product multiple times in a row,
//  * without having to manually change the title and handle of the previous copies.
//  */
// const createCopyTitleAndHandle = (title: string, handle: string) => {
//   const timestamp = new Date().toLocaleTimeString(undefined, {
//     hour: "numeric",
//     minute: "numeric",
//     second: "numeric",
//   });

//   // If the product has already been copied, we want to remove the previous copy title
//   const newTitle = `${title.replace(
//     / \(\d{1,}:\d{1,}:\d{1,}\)$/,
//     "",
//   )} (${timestamp})`;

//   // If the handle already contains a timestamp, we replace it with the new one
//   const newHandle = `${handle.replace(
//     /-copy(-\d{1,}){3}(-am|pm])*/g,
//     "",
//   )}-copy-${timestamp.replace(/:/g, "-").toLowerCase()}`;

//   return { newTitle, newHandle };
// };

// const useCopyProduct = () => {
//   const router = useRouter();

//   const dashboardRep = ReplicacheInstancesStore((state) => state.dashboardRep);
//   const notification = useNotification();

//   const handleCopyProduct = async (product: Product) => {
//     const {
//       variants,
//       options,
//       type,
//       tags,
//       images,
//       collection_id,
//       collection,
//       sales_channels,
//       title,
//       handle,
//       ...rest
//     } = omit(product, [
//       "id",
//       "created_at",
//       "updated_at",
//       "deleted_at",
//       "external_id",
//       "profile_id",
//       "profile",
//       "type_id",
//       "status",
//       "version",
//     ]);

//     const base: Partial<Product> = Object.entries(rest).reduce(
//       (acc, [key, value]) => {
//         if (value) {
//           // @ts-ignore
//           acc[key] = value;
//         }

//         return acc;
//       },
//       {} as Partial<Product>,
//     );

//     const optionRankMap: Record<string, number> = {};

//     if (options && options.length) {
//       options.forEach((option, i) => {
//         if (!base.options) {
//           base.options = [];
//         }

//         optionRankMap[option.id] = i;

//         base.options.push({
//           title: option.title,
//         });
//       });
//     }

//     if (variants && variants.length) {
//       const copiedVariants: Product["variants"] = [];

//       variants.forEach((variant: ProductVariant) => {
//         const { prices, options, ...rest } = omit(variant, [
//           "id",
//           "sku",
//           "created_at",
//           "updated_at",
//           "deleted_at",
//           "product",
//           "product_id",
//           "variant_rank",
//           "purchasable",
//         ]);

//         const variantBase = Object.entries(rest).reduce(
//           (acc, [key, value]) => {
//             if (value) {
//               acc[key] = value;
//             }

//             return acc;
//           },
//           {} as NonNullable<Product["variants"]>[0],
//         );

//         variantBase.prices = [];

//         if (prices && prices.length) {
//           variantBase.prices = prices.map((price) => ({
//             amount: price.amount,
//             currency_code: !price.region_id ? price.currency_code : undefined,
//             region_id: price.region_id,
//           }));
//         }

//         if (options && options.length) {
//           // Sort the options by rank by looking up the rank in the optionRankMap
//           const sortedOptions = options.sort(
//             (a, b) => optionRankMap[a.option_id] - optionRankMap[b.option_id],
//           );

//           variantBase.options = sortedOptions.map((option) => ({
//             value: option.value,
//           }));
//         }

//         copiedVariants.push(variantBase);
//       });

//       base.variants = copiedVariants;
//     }

//     if (images && images.length) {
//       base.images = images.map((image) => image.url);
//     }

//     if (collection) {
//       base.collection_id = collection.id;
//     } else if (collection_id) {
//       base.collection_id = collection_id;
//     }

//     if (sales_channels && sales_channels.length) {
//       base.sales_channels = sales_channels.map((channel) => ({
//         id: channel.id,
//       }));
//     }

//     if (tags && tags.length) {
//       base.tags = tags.map(({ id, value }) => ({ id, value }));
//     }

//     base.status = "draft";

//     const { newTitle, newHandle } = createCopyTitleAndHandle(
//       title,
//       handle || "",
//     );
//     base.id = generateId({ id: ulid(), prefix: "product" });
//     base.title = newTitle;
//     base.handle = newHandle;

//     if (dashboardRep) {
//       try {
//         await dashboardRep.mutate.createProduct({
//           product: base,
//         });
//         router.push(`/a/products/${base.id}`);
//         notification("Success", "Created a new product", "success");
//       } catch (error) {
//         notification("Error", getErrorMessage(error), "error");
//       }
//     }
//   };

//   return handleCopyProduct;
// };

// export default useCopyProduct;
