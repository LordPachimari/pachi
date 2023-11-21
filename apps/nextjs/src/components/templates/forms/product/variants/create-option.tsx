/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useCallback } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { PlusIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import debounce from "lodash.debounce";
import { Trash2Icon } from "lucide-react";
import { ulid } from "ulid";

import type { ProductOption, ProductVariant } from "@pachi/db";
import { generateId } from "@pachi/utils";

import { Button } from "~/components/atoms/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/atoms/tooltip";
import { Table } from "~/components/templates/tables/variants-table";
import { ReplicacheInstancesStore } from "~/zustand/replicache";
import Option from "./option";

interface CreateOptionProps {
  product_id: string;
  options: ProductOption[];
  variants: ProductVariant[];
  createVariant: () => Promise<void>;
  openVariantModal: (prop: { variantId: string }) => void;
}
export default function CreateOption({
  product_id,
  options,
  variants,
  createVariant,
  openVariantModal,
}: CreateOptionProps) {
  const dashboardRep = ReplicacheInstancesStore((state) => state.dashboardRep);
  const createOption = useCallback(async () => {
    const id = generateId({ id: ulid(), prefix: "opt" });
    const option: ProductOption = { id, product_id };
    await dashboardRep?.mutate.createProductOption({ args: { option } });
  }, [dashboardRep, product_id]);
  const deleteOption = useCallback(
    async ({ id, productId }: { id: string; productId: string }) => {
      await dashboardRep?.mutate.deleteProductOption({
        args: { id, productId },
      });
    },
    [dashboardRep],
  );
  const onNameChange = useCallback(
    debounce(async (option_id: string, name: string) => {
      await dashboardRep?.mutate.updateProductOption({
        args: { option_id, product_id, updates: { name } },
      });
    }, 500),
    [dashboardRep],
  );
  const onValuesChange = useCallback(
    debounce(async (option_id: string, values: string[]) => {
      await dashboardRep?.mutate.updateProductOptionValues({
        args: { option_id, product_id, new_option_values: values },
      });
    }, 500),
    [dashboardRep],
  );

  const [parent, enableAnimations] = useAutoAnimate(/* optional config */);
  console.log("variants", variants);
  return (
    <div className="w-full" ref={parent}>
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
        className=" mt-2 flex w-full gap-2 bg-brand  md:w-fit"
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
      <li ref={parent} className="flex list-none flex-col gap-2">
        {options.map((option) => (
          <div key={option.id} className="flex gap-2">
            <Option
              onNameChange={onNameChange}
              onValuesChange={onValuesChange}
              option={option}
            />
            <Button
              size="icon"
              className="bg-red-300 hover:bg-red-400 "
              onClick={async () =>
                await deleteOption({ id: option.id, productId: product_id })
              }
            >
              <Trash2Icon className="text-red-500" />
            </Button>
          </div>
        ))}
      </li>
      <h2 className="text-md my-2 font-semibold ">Create variant</h2>

      <Button
        className=" flex w-full gap-2 bg-brand  md:w-fit"
        onClick={createVariant}
        disabled={!!(!options[0]?.name && !options[0]?.values)}
      >
        <PlusIcon fontSize={10} />
        Add variant
      </Button>
      {
        //there is always one default variant
      }
      {variants.length > 1 && <Table data={variants} />}
    </div>
  );
}
