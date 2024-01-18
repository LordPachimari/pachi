import { useCallback, useEffect, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import debounce from "lodash.debounce";

import type { UpdateProductVariantProps } from "@pachi/api";
import type { ProductVariant, ProductVariantUpdates } from "@pachi/db";

import InputField from "~/components/molecules/input-field";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";

interface InventoryProps {
  updateVariant: (props: UpdateProductVariantProps["args"]) => Promise<void>;
  variant: ProductVariant;
}
const Inventory = ({ updateVariant, variant }: InventoryProps) => {
  const onInputChange = useCallback(
    debounce(async ({ updates }: { updates: ProductVariantUpdates }) => {
      await updateVariant({
        updates,
        variantId: variant.id,
        productId: variant.productId,
      });
    }, 500),
    [updateVariant],
  );
  const [parent, enableAnimations] = useAutoAnimate(/* optional config */);
  const [hasCode, setHasCode] = useState(false);
  useEffect(() => {
    if (variant.barcode ?? variant.hsCode ?? variant.sku) {
      setHasCode(true);
    }
  }, [variant.barcode, variant.hsCode, variant.sku]);

  return (
    <div>
      <h2 className="text-md font-semibold">Inventory</h2>
      <Input
        type="number"
        className="my-2"
        defaultValue={variant.inventoryQuantity}
        min={0}
        onChange={async (e) => {
          await onInputChange({
            updates: { inventoryQuantity: e.currentTarget.valueAsNumber },
          });
        }}
      />
      <span className="flex items-center gap-2">
        <Checkbox
          className="my-2"
          defaultChecked={variant.allowBackorder ?? false}
          onCheckedChange={async (e) =>
            await updateVariant({
              updates: {
                allowBackorder: e as boolean,
              },
              variantId: variant.id,
              productId: variant.productId,
            })
          }
        />
        <p className="text-sm">Continue selling when out of stock</p>
      </span>
      <span className="flex items-center gap-2">
        <Checkbox
          className="my-2"
          checked={hasCode}
          onCheckedChange={(e) => setHasCode(e as boolean)}
        />
        <p className="text-sm">This product has SKU or Barcode</p>
      </span>
      <div className="my-2  flex  gap-4" ref={parent}>
        {hasCode && (
          <>
            <span className="w-full">
              <InputField
                label="SKU (Stock Keeping Unit)"
                placeholder="SKU"
                defaultValue={variant.sku ?? ""}
                onChange={async (e) => {
                  await onInputChange({
                    updates: { sku: e.currentTarget.value },
                  });
                }}
              />
            </span>
            <span className="w-full">
              <InputField
                label="Barcode (ISBN, UPC, GTIN, etc.)"
                defaultValue={variant.barcode ?? ""}
                placeholder="Barcode"
                onChange={async (e) => {
                  await onInputChange({
                    updates: { barcode: e.currentTarget.value },
                  });
                }}
              />
            </span>
          </>
        )}
      </div>
    </div>
  );
};
export default Inventory;
