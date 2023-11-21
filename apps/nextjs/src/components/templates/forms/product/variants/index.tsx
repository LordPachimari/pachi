import type { ProductOption, ProductVariant } from "@pachi/db";

import { Separator } from "~/components/atoms/separator";
import { Info } from "../info";
import CreateOption from "./create-option";

interface VariantsProps {
  product_id: string;
  options: ProductOption[];
  variants: ProductVariant[];
  createVariant: () => Promise<void>;
  openVariantModal: (prop: { variantId: string }) => void;
}
export default function Variants({
  product_id,
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
        product_id={product_id}
        options={options}
        variants={variants}
        createVariant={createVariant}
        openVariantModal={openVariantModal}
      />
    </div>
  );
}
