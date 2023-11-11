import type { ProductStatus } from "@pachi/types";

export const getProductStatusVariant = (status: ProductStatus) => {
  switch (status) {
    case "proposed":
      return "warning";
    case "published":
      return "success";
    case "rejected":
      return "danger";
    case "draft":
    default:
      return "default";
  }
};
