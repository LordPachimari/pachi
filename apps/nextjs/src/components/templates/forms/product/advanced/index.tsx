import { useCallback } from "react";
import debounce from "lodash.debounce";

import type { Client, UpdateProductVariant } from "@pachi/validators";

import InputField from "~/components/molecules/input-field";
import { Separator } from "~/components/ui/separator";
import { Info } from "../info";

interface AdvancedProps {
  updateVariant: (props: UpdateProductVariant) => Promise<void>;
  variant: Client.ProductVariant | undefined;
}

export default function Advanced({ updateVariant, variant }: AdvancedProps) {
  const onInputChange = useCallback(
    debounce(
      async ({ updates }: { updates: UpdateProductVariant["updates"] }) => {
        console.log("updates", updates);

        if (variant)
          await updateVariant({
            updates,
            variantId: variant.id,
            productId: variant.productId,
          });
      },
      500,
    ),
    [updateVariant],
  );
  console.log("variant", variant);

  return (
    <div className="flex w-full flex-col  px-4 py-2">
      <Info
        title="Shipping"
        description="
        Configure to calculate the most accurate shipping rate
      "
      />

      <div className="grid w-full grid-cols-4 gap-2">
        <InputField
          label="width (cm)"
          placeholder="width"
          type="number"
          defaultValue={variant?.width ?? 0}
          onChange={async (e) => {
            await onInputChange({
              updates: { width: e.currentTarget.valueAsNumber },
            });
          }}
        />
        <InputField
          label="length (cm)"
          placeholder="length"
          type="number"
          defaultValue={variant?.length ?? 0}
          onChange={async (e) =>
            await onInputChange({
              updates: { length: e.currentTarget.valueAsNumber },
            })
          }
        />
        <InputField
          label="height (cm)"
          type="number"
          placeholder="height"
          defaultValue={variant?.height ?? 0}
          onChange={async (e) =>
            await onInputChange({
              updates: { height: e.currentTarget.valueAsNumber },
            })
          }
        />
        <InputField
          label="weight (kg)"
          placeholder="weight"
          type="number"
          defaultValue={variant?.weight ?? 0}
          onChange={async (e) =>
            await onInputChange({
              updates: { weight: e.currentTarget.valueAsNumber },
            })
          }
        />
      </div>
      <Separator className="my-4" />

      <Info
        title="Customs"
        description="Configure if you are shipping internationally"
      />

      <div className="grid w-full grid-cols-2 gap-2">
        <InputField
          label="MID code"
          defaultValue={variant?.midCode ?? ""}
          onChange={async (e) =>
            await onInputChange({
              updates: { midCode: e.currentTarget.value },
            })
          }
        />
        <InputField
          label="HS code"
          defaultValue={variant?.hsCode ?? ""}
          onChange={async (e) =>
            await onInputChange({
              updates: { hsCode: e.currentTarget.value },
            })
          }
        />
        <InputField
          label="Country of origin"
          defaultValue={variant?.originCountry ?? ""}
          onChange={async (e) =>
            await onInputChange({
              updates: { originCountry: e.currentTarget.value },
            })
          }
        />
      </div>

      <Separator className="my-4" />
      <Info title="Sales channels" description="Configure sales channels" />
    </div>
  );
}
