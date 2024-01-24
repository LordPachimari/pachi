import type { ProductOption, ProductVariant } from "@pachi/db";

import { Separator } from "~/components/ui/separator";
import { Info } from "../info";
import CreateOption from "./create-option";

interface VariantsProps {
  productId: string;
  options: ProductOption[];
  variants: ProductVariant[];
  createVariant: () => Promise<void>;
  openVariantModal: (prop: { variantId: string }) => void;
}
export default function Variants({
  productId,
  options,
  variants,
  createVariant,
  openVariantModal,
}: VariantsProps) {
  return (
    <div className="px-4 py-2">
      <Info
        title="Create variants"
        description="Add variations to this product"
      />
      <Separator className="my-2" />
      <CreateOption
        productId={productId}
        options={options}
        variants={variants}
        createVariant={createVariant}
        openVariantModal={openVariantModal}
      />
    </div>
  );
}
