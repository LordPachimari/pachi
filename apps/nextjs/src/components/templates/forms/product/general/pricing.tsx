import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";

import type { UpdatePriceProps } from "@pachi/api";
import { type Currency, type ProductVariant } from "@pachi/db";

import { Button } from "~/components/atoms/button";
import { Label } from "~/components/atoms/label";
import { RadioGroup } from "~/components/atoms/radio-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
  SheetTrigger,
} from "~/components/atoms/sheet";
import CurrencyModal from "~/components/templates/modals/currency";
import { Table } from "~/components/templates/tables/currency-table";
import { CurrencyInput } from "./currency-input";

interface PricingProps {
  updatePrice: (props: UpdatePriceProps["args"]) => Promise<void>;
  variant: ProductVariant;
  store_currencies: string[];
  storeId: string;
  productId: string;
}
const Pricing = ({
  variant,
  updatePrice,
  store_currencies,
  storeId,
  productId,
}: PricingProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);
  };
  const [activePrice, setActivePrice] = useState(
    variant.prices?.[0] ? variant.prices[0] : undefined,
  );

  console.log("variant", variant);

  return (
    <div>
      <h2 className="text-md py-2 font-semibold">Pricing</h2>
      <span className="flex items-center justify-between">
        {variant.prices && activePrice?.id && (
          <RadioGroup className="my-2 flex" defaultValue={activePrice?.id}>
            {variant.prices.map((price) => (
              <div className="flex items-center gap-x-3 " key={price.id}>
                <RadioGroup.Item
                  value={price.id}
                  id={price.id}
                  className="text-green-500"
                  onClick={() => setActivePrice(price)}
                />
                <Label htmlFor={price.currency_code}>
                  {price.currency_code}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
        <CurrencyModal close={close} isOpen={isOpen} open={open}>
          <Table
            store_currencies={store_currencies}
            storeId={storeId}
            variantId={variant.id}
            prices={variant.prices ?? []}
            productId={productId}
            close={close}
          />
        </CurrencyModal>
      </span>
      {activePrice && (
        <CurrencyInput
          code={activePrice.currency_code}
          symbol={activePrice.currency_code}
          className="my-1"
          defaultValue={activePrice.amount / 100}
          onChange={async (e) => {
            const cleanedValue = e.currentTarget.value.replace(/,/g, "");
            let valueInCents = Math.floor(parseFloat(cleanedValue) * 100);
            if (isNaN(valueInCents)) {
              valueInCents = 0;
            }
            console.log("e", valueInCents);
            await updatePrice({
              money_amount_id: activePrice.id,
              updates: { amount: valueInCents },
              variant_id: variant.id,
              product_id: variant.product_id,
            });
          }}
        />
      )}
    </div>
  );
};
export default Pricing;
