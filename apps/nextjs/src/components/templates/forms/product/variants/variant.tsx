import { useState } from "react";

import type {
  UpdatePriceProps,
  UpdateProductVariantProps,
  UploadImagesProps,
} from "@pachi/api";
import type {
  Currency,
  Image,
  ProductOption,
  ProductOptionValue,
  ProductVariant,
} from "@pachi/db";

import { Dialog, DialogContent } from "~/components/atoms/dialog";
import { ScrollArea } from "~/components/atoms/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/atoms/select";
import Inventory from "../general/inventory";
import Media from "../general/media";
import Pricing from "../general/pricing";

interface VariantProps {
  product_id: string;
  images: Image[];
  // trigger: React.ReactNode;
  options: ProductOption[];
  variant: ProductVariant;
  option_name?: string;
  option_value?: string;
  uploadProductImages: (props: UploadImagesProps["args"]) => Promise<void>;
  updatePrice: (props: UpdatePriceProps["args"]) => Promise<void>;

  updateVariant: (props: UpdateProductVariantProps["args"]) => Promise<void>;
  currencies: Currency[];
}
export default function VariantModal({
  images,
  // trigger,
  product_id,
  options,
  option_name,
  option_value,
  variant,
  uploadProductImages,
  updatePrice,
  updateVariant,
  currencies,
}: VariantProps) {
  const [files, setFiles] = useState<Image[]>([]);
  const [optionName, setOptionName] = useState(
    option_name ? option_name : options[0]!.name ? options[0]!.name : "",
  );
  console.log("options", options);
  const optionsMap = options.reduce(
    (acc, option) => {
      if (option.name && option.values) {
        acc[option.name] = option.values;
        return acc;
      }
      return acc;
    },
    {} as Record<string, ProductOptionValue[]>,
  );
  const values = optionsMap[optionName] ?? [];
  console.log("variant values", values);

  return (
    <Dialog defaultOpen={true}>
      {/* <DialogTrigger>{trigger}</DialogTrigger> */}

      <DialogContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="p-8">
            <p className="text-md py-2 font-semibold">Variant</p>
            <div className="flex w-full  gap-4">
              <Select
                defaultValue={optionName}
                onValueChange={(value) => setOptionName(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.keys(optionsMap).map((name) => (
                      <SelectItem value={name} key={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select defaultValue={option_value ?? ""}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {values.map((value) => (
                      <SelectItem value={value.value} key={value.value}>
                        {value.value}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <h2 className="text-md py-2 font-semibold">{`Media (optional)`}</h2>
            <Media
              images={images}
              product_id={product_id}
              files={files}
              setFiles={setFiles}
              uploadProductImages={uploadProductImages}
              variant_id={variant.id}
            />
            <Pricing
              updatePrice={updatePrice}
              variant={variant}
              store_currencies={currencies}
            />
            <Inventory updateVariant={updateVariant} variant={variant} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
