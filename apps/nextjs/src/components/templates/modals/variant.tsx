import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

import type {
  UpdatePriceProps,
  UpdateProductVariantProps,
  UploadImagesProps,
} from "@pachi/api";
import type {
  Image,
  ProductOption,
  ProductOptionValue,
  ProductVariant,
} from "@pachi/db";

import { ScrollArea } from "~/components/atoms/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/atoms/select";
import Inventory from "../forms/product/general/inventory";
import Media from "../forms/product/general/media";
import Pricing from "../forms/product/general/pricing";

interface VariantModalProps {
  closeModal: () => void;
  isOpen: boolean;
  productId: string;
  images: Image[];
  // trigger: React.ReactNode;
  options: ProductOption[];
  variant: ProductVariant;
  optionName?: string;
  optionValue?: string;
  storeId: string;
  uploadProductImages: (props: UploadImagesProps["args"]) => Promise<void>;
  updatePrice: (props: UpdatePriceProps["args"]) => Promise<void>;

  updateVariant: (props: UpdateProductVariantProps["args"]) => Promise<void>;
  currencies: string[];
}
export default function VariantModal({
  closeModal,
  isOpen,
  currencies,
  images,
  options,
  productId,
  storeId,
  updatePrice,
  updateVariant,
  uploadProductImages,
  variant,
  optionName,
  optionValue,
}: VariantModalProps) {
  const [files, setFiles] = useState<Image[]>([]);

  console.log("options", options);
  const [optionNameState, setOptionNameState] = useState(
    optionName ? optionName : options[0]!.name ? options[0]!.name : "",
  );
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
  const values = optionsMap[optionNameState] ?? [];
  console.log("variant values", values);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-component p-6 text-left align-middle shadow-xl transition-all ">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-slate-11"
                >
                  Variant
                </Dialog.Title>

                <div className="flex w-full  gap-4">
                  <Select
                    defaultValue={optionNameState}
                    onValueChange={(value) => setOptionNameState(value)}
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

                  <Select defaultValue={optionValue ?? ""}>
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
                  productId={productId}
                  files={files}
                  setFiles={setFiles}
                  uploadProductImages={uploadProductImages}
                  variantId={variant.id}
                />
                <Pricing
                  updatePrice={updatePrice}
                  variant={variant}
                  storeCurrencies={currencies}
                  productId={productId}
                  storeId={storeId}
                />
                <Inventory updateVariant={updateVariant} variant={variant} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
