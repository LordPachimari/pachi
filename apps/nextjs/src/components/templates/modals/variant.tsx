import { Fragment, useCallback, useEffect, useState } from "react"
import { Dialog, Listbox, Transition } from "@headlessui/react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import type {
  AssignProductOptionValueToVariant,
  UpdateProductImagesOrder,
  UpdateProductPrice,
  UpdateProductVariant,
  UploadProductImages,
} from "@pachi/core"
import type {
  Image,
  ProductOption,
  ProductOptionValue,
  ProductVariant,
} from "@pachi/db"

import Inventory from "../forms/product/general/inventory"
import Media from "../forms/product/general/media"
import Pricing from "../forms/product/general/pricing"

interface VariantModalProps {
  closeModal: () => void
  isOpen: boolean
  productId: string
  images: Image[]
  // trigger: React.ReactNode;
  options: ProductOption[]
  variant: ProductVariant
  storeId: string
  uploadProductImages: (props: UploadProductImages) => Promise<void>
  updatePrice: (props: UpdateProductPrice) => Promise<void>

  updateVariant: (props: UpdateProductVariant) => Promise<void>
  currencies: string[]
  updateProductImagesOrder: ({
    order,
    productId,
    variantId,
  }: UpdateProductImagesOrder) => Promise<void>
  onOptionValueChange: ({
    optionValueId,
    prevOptionValueId,
    productId,
    variantId,
  }: AssignProductOptionValueToVariant) => Promise<void>
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
  updateProductImagesOrder,
  onOptionValueChange,
}: Readonly<VariantModalProps>) {
  const [files, setFiles] = useState<Image[]>([])
  const [variantOptions, setVariantOptions] = useState<
    Record<string, { id: string; value: string }>
  >({})

  useEffect(() => {
    if (variant.optionValues && variant.optionValues.length > 0) {
      const variantOptionsMap = variant.optionValues.reduce(
        (acc, optionValue) => {
          if (
            optionValue.optionValue.option?.name &&
            optionValue.optionValue.value
          ) {
            acc[optionValue.optionValue.option.name] = {
              id: optionValue.optionValue.id,
              value: optionValue.optionValue.value,
            }
            return acc
          }
          return acc
        },
        {} as Record<string, { id: string; value: string }>,
      )
      setVariantOptions(variantOptionsMap)
    }
  }, [variant.optionValues])
  const optionsMap = options.reduce(
    (acc, option) => {
      if (option.name && option.values) {
        acc[option.name] = option.values
        return acc
      }
      return acc
    },
    {} as Record<string, ProductOptionValue[]>,
  )
  const onSelected = useCallback(
    async ({
      optionValue,
      optionId,
    }: {
      optionValue: { id: string; value: string }
      optionId: string
    }) => {
      if (optionId && optionValue) {
        await onOptionValueChange({
          optionValueId: optionValue.id,
          ...(variantOptions[optionId] !== undefined && {
            prevOptionValueId: variantOptions[optionId]!.id,
          }),
          productId,
          variantId: variant.id,
        })
        setVariantOptions((prev) => {
          return {
            ...prev,
            [optionId]: { id: optionValue.id, value: optionValue.value },
          }
        })
      }
    },
    [onOptionValueChange, productId, variant.id, variantOptions],
  )

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-component p-10 text-left align-middle shadow-xl transition-all ">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-slate-11"
                >
                  Variant
                </Dialog.Title>

                <div className="flex w-full flex-col gap-4">
                  {options.map((option, index) => {
                    if (!option.name) return <></>
                    return (
                      <div className="flex items-center  gap-2" key={index}>
                        <span className="flex h-[30px] min-w-[60px] items-center justify-center rounded-md border">
                          {option.name}
                        </span>

                        <Listbox
                          defaultValue={
                            variantOptions[option.name]
                              ? {
                                  optionValue: {
                                    id: variantOptions[option.name]!.id,
                                    value:
                                      variantOptions[option.name]!.value ?? "",
                                  },
                                  optionId: option.id,
                                }
                              : {
                                  optionValue: {
                                    id: "",
                                    value: "",
                                  },
                                  optionId: option.id,
                                }
                          }
                          onChange={async (e) =>
                            await onSelected({
                              optionValue: e.optionValue,
                              optionId: e.optionId,
                            })
                          }
                        >
                          <div className="relative  w-[100px]">
                            <Listbox.Button className="relative h-[30px] w-full cursor-default rounded-sm border bg-white  text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2  sm:text-sm">
                              <span className="block truncate">
                                {variantOptions[option.name]?.value ?? ""}
                              </span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronsUpDownIcon
                                  className="h-5 w-5 text-gray-400"
                                  aria-hidden="true"
                                />
                              </span>
                            </Listbox.Button>
                            <Transition
                              as={Fragment}
                              leave="transition ease-in duration-100"
                              leaveFrom="opacity-100"
                              leaveTo="opacity-0"
                            >
                              <Listbox.Options className="absolute mt-1 max-h-60 w-full  overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                {(optionsMap[option.name] ?? []).map(
                                  (optionValue) => {
                                    console.log("value", optionValue)
                                    return (
                                      <Listbox.Option
                                        key={optionValue.value}
                                        className={({ active }) =>
                                          `relative z-20   cursor-default select-none bg-white py-2 ${
                                            active
                                              ? "bg-amber-100 text-amber-900"
                                              : "text-gray-900"
                                          }`
                                        }
                                        value={{
                                          optionValue: optionValue,
                                          optionId: option.id,
                                        }}
                                      >
                                        {({ selected }) => (
                                          <>
                                            <span
                                              className={`block w-[200px] truncate ${
                                                selected
                                                  ? "font-medium"
                                                  : "font-normal"
                                              }`}
                                            >
                                              {optionValue.value}
                                            </span>
                                            {selected ? (
                                              <span className="absolute inset-y-0 left-0 flex w-[200px] items-center pl-3 text-amber-600">
                                                <CheckIcon
                                                  className="h-5 w-5"
                                                  aria-hidden="true"
                                                />
                                              </span>
                                            ) : null}
                                          </>
                                        )}
                                      </Listbox.Option>
                                    )
                                  },
                                )}
                              </Listbox.Options>
                            </Transition>
                          </div>
                        </Listbox>
                      </div>
                    )
                  })}
                </div>
                <h2 className="text-md py-2 font-semibold">{`Media (optional)`}</h2>
                <Media
                  images={images}
                  productId={productId}
                  files={files}
                  setFiles={setFiles}
                  uploadProductImages={uploadProductImages}
                  variantId={variant.id}
                  updateProductImagesOrder={updateProductImagesOrder}
                />
                <Pricing
                  updatePrice={updatePrice}
                  variant={variant}
                  productCurrencyCodes={
                    (variant.prices ?? []).map((price) => price.currencyCode) ??
                    []
                  }
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
  )
}
