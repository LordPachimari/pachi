import { useCallback, useEffect, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import debounce from "lodash.debounce";

import type { UpdateProductVariantProps } from "@pachi/api";
import type { ProductVariant, ProductVariantUpdates } from "@pachi/db";

import { Checkbox } from "~/components/atoms/checkbox";
import { Input } from "~/components/atoms/input";
import InputField from "~/components/molecules/input-field";

interface InventoryProps {
  updateVariant: (props: UpdateProductVariantProps["args"]) => Promise<void>;
  variant: ProductVariant;
}
const Inventory = ({ updateVariant, variant }: InventoryProps) => {
  const onInputChange = useCallback(
    debounce(async ({ updates }: { updates: ProductVariantUpdates }) => {
      await updateVariant({
        updates,
        variant_id: variant.id,
        product_id: variant.product_id,
      });
    }, 500),
    [updateVariant],
  );
  const [parent, enableAnimations] = useAutoAnimate(/* optional config */);
  const [hasCode, setHasCode] = useState(false);
  useEffect(() => {
    if (variant.barcode ?? variant.hs_code ?? variant.sku) {
      setHasCode(true);
    }
  }, [variant.barcode, variant.hs_code, variant.sku]);

  return (
    <div>
      <h2 className="text-md font-semibold">Inventory</h2>
      <Input
        type="number"
        className="my-2"
        defaultValue={variant.inventory_quantity}
        min={0}
        onChange={async (e) => {
          await onInputChange({
            updates: { inventory_quantity: e.currentTarget.valueAsNumber },
          });
        }}
      />
      <span className="flex items-center gap-2">
        <Checkbox
          className="my-2"
          defaultChecked={variant.allow_backorder ?? false}
          onCheckedChange={async (e) =>
            await updateVariant({
              updates: {
                allow_backorder: e as boolean,
              },
              variant_id: variant.id,
              product_id: variant.product_id,
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
