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
  SheetTitle,
  SheetTrigger,
} from "~/components/atoms/sheet";
import { Table } from "~/components/templates/tables/currency-table";
import { CurrencyInput } from "./currency-input";

interface PricingProps {
  updatePrice: (props: UpdatePriceProps["args"]) => Promise<void>;
  variant: ProductVariant;
  store_currencies: Currency[];
}
const Pricing = ({ variant, updatePrice, store_currencies }: PricingProps) => {
  const [prices, setPrices] = useState(variant.prices);
  const [activePrice, setActivePrice] = useState(
    variant.prices?.[0] ? variant.prices[0] : undefined,
  );
  useEffect(() => {
    setPrices(variant.prices);
  }, [variant]);
  console.log("variant", variant);

  return (
    <div>
      <h2 className="text-md py-2 font-semibold">Pricing</h2>
      <span className="flex items-center justify-between">
        {prices && prices.length > 0 && activePrice?.id && (
          <RadioGroup className="my-2 flex" defaultValue={activePrice?.id}>
            {prices?.map((price) => (
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
        <Sheet>
          <SheetTrigger>
            <Button size="icon" className="h-4 w-4 bg-brand shadow-ruby-7">
              <PlusIcon size={10} />
            </Button>
          </SheetTrigger>

          <SheetHeader>
            <SheetTitle>Currencies</SheetTitle>
          </SheetHeader>
          <SheetContent>
            {/* <ScrollArea className="h-screen"> */}
            <Table store_currencies={store_currencies} />
            {/* </ScrollArea> */}
          </SheetContent>
        </Sheet>
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
