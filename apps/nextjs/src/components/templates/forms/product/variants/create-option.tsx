import { useCallback } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { PlusIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import debounce from "lodash.debounce";
import { Trash2Icon } from "lucide-react";
import { ulid } from "ulid";

import { generateId } from "@pachi/utils";
import type {
  Client,
  DeleteProductOption,
  DeleteProductVariant,
} from "@pachi/validators";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useReplicache } from "~/zustand/replicache";
import Option from "./option";

interface CreateOptionProps {
  productId: string;
  options: Client.ProductOption[];
  variants: Client.ProductVariant[];
  createVariant: () => Promise<void>;
  openVariantModal: (prop: { variantId: string }) => void;
}

export default function CreateOption({
  productId,
  options,
  variants,
  createVariant,
  openVariantModal,
}: CreateOptionProps) {
  const { dashboardRep } = useReplicache();
  const createOption = useCallback(async () => {
    const id = generateId({ id: ulid(), prefix: "opt" });
    const option: Client.ProductOption = { id, productId };
    await dashboardRep?.mutate.createProductOption({ option });
  }, [dashboardRep, productId]);
  const deleteOption = useCallback(
    async ({ optionId, productId }: DeleteProductOption) => {
      await dashboardRep?.mutate.deleteProductOption({
        optionId,
        productId,
      });
    },
    [dashboardRep],
  );
  const onOptionNameChange = useCallback(
    debounce(async (optionId: string, name: string) => {
      await dashboardRep?.mutate.updateProductOption({
        optionId,
        productId,
        updates: { name },
      });
    }, 500),
    [dashboardRep],
  );
  const onOptionValuesChange = useCallback(
    debounce(async (optionId: string, values: string[]) => {
      const newOptionValues: Client.ProductOptionValue[] = values.map(
        (value) => ({
          id: generateId({ id: ulid(), prefix: "opt_val" }),
          optionId,
          value,
          option: options.find((o) => o.id === optionId)!,
        }),
      );

      await dashboardRep?.mutate.updateProductOptionValues({
        optionId,
        productId,
        newOptionValues,
      });
    }, 500),
    [dashboardRep],
  );
  const deleteVariant = useCallback(
    async ({ variantId, productId }: DeleteProductVariant) => {
      await dashboardRep?.mutate.deleteProductVariant({
        variantId,
        productId,
      });
    },
    [dashboardRep],
  );

  const [parent] = useAutoAnimate(/* optional config */);
  console.log("variants", variants);

  return (
    <div className="w-full lg:max-w-[380px]" ref={parent}>
      <span className="flex items-center gap-2">
        <h2 className="text-md font-semibold ">Create option</h2>
        <Tooltip>
          <TooltipTrigger>
            <QuestionMarkCircledIcon />
          </TooltipTrigger>
          <TooltipContent>
            <p>Create an option like size and color</p>
          </TooltipContent>
        </Tooltip>
      </span>
      <Button
        className=" bg-brand mt-2 flex w-full gap-2  md:w-fit"
        onClick={createOption}
      >
        <PlusIcon fontSize={10} />
        Add option
      </Button>
      {options.length > 0 && (
        <span className="my-2 flex w-full gap-2">
          <label className="w-full text-sm md:w-[120px]">{"Option name"}</label>
          <label className="text-sm">{"Option values "}</label>
        </span>
      )}
      <li ref={parent} className="flex list-none flex-col gap-2 ">
        {options.map((option) => (
          <div key={option.id} className="flex gap-2">
            <Option
              onOptionNameChange={onOptionNameChange}
              onOptionValuesChange={onOptionValuesChange}
              option={option}
            />
            <Button
              size="icon"
              className="bg-red-300 hover:bg-red-400 "
              onClick={async () =>
                await deleteOption({
                  optionId: option.id,
                  productId: productId,
                })
              }
            >
              <Trash2Icon className="text-red-500" />
            </Button>
          </div>
        ))}
      </li>
      <h2 className="text-md my-2 font-semibold ">Create variant</h2>

      <Button
        className=" bg-brand my-2 flex w-full gap-2  md:w-fit"
        onClick={createVariant}
        disabled={!!(!options[0]?.name && !options[0]?.values)}
      >
        <PlusIcon fontSize={10} />
        Add variant
      </Button>
      {
        //there is always one default variant
      }
      <div className="flex flex-col gap-1" ref={parent}>
        {variants.length > 1 &&
          //skip default variant
          variants.slice(1).map((variant) => (
            <Card
              key={variant.id}
              className="flex h-14 cursor-pointer flex-row items-center p-2"
              onClick={() => {
                openVariantModal({ variantId: variant.id });
              }}
            >
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <section className="flex w-full justify-between pl-2">
                <div>
                  <span className="flex h-2/5 gap-2">
                    <p className="w-20 text-sm">Name</p>
                    <p className="w-20 text-sm">Price</p>
                  </span>
                  <span className="flex h-3/5 gap-2">
                    <p className="w-20 text-sm">
                      {variant.optionValues
                        ?.map((ov) => `${ov.value.value}`)
                        .join("/")}
                    </p>
                    <p className="w-20 text-sm">
                      {`${variant.prices?.[0]?.currencyCode ?? ""} ${
                        variant.prices?.[0]?.amount ?? 0
                      }`}
                    </p>
                  </span>
                </div>
                <div>
                  <Button
                    size="icon"
                    className="bg-red-300 hover:bg-red-400 "
                    onClick={async () =>
                      await deleteVariant({
                        variantId: variant.id,
                        productId,
                      })
                    }
                  >
                    <Trash2Icon className="text-red-500" />
                  </Button>
                </div>
              </section>
            </Card>
          ))}
      </div>
    </div>
  );
}
