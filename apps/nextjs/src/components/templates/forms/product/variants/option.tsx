import { useEffect, useState } from "react";

import type { ProductOption } from "@pachi/db";

import TagInput from "~/components/molecules/tag-input";
import { Input } from "~/components/ui/input";
import type { DebouncedFunc } from "~/types";

interface OptionProps {
  option: ProductOption;
  onOptionNameChange: DebouncedFunc<
    (id: string, name: string) => Promise<void>
  >;
  onOptionValuesChange: DebouncedFunc<
    (optionId: string, values: string[]) => Promise<void>
  >;
}

export default function Option({
  option,
  onOptionNameChange,
  onOptionValuesChange,
}: OptionProps) {
  console.log("option", option);
  const [values, setValues] = useState<string[]>([]);

  useEffect(() => {
    const values = option.values?.map((v) => v.value) ?? [];
    setValues(values);
  }, [option]);

  return (
    <div className="flex gap-2">
      <Input
        className="w-full md:w-[120px]"
        defaultValue={option.name ?? ""}
        placeholder="Size, color"
        onChange={async (e) => {
          console.log("option id", option.id);
          await onOptionNameChange(option.id, e.target.value);
        }}
      />
      <TagInput
        values={values}
        onChange={async (values) => {
          setValues(values as string[]);
          await onOptionValuesChange(option.id, values as string[]);
        }}
        className="w-full"
        placeholder="green, large, (comma separated)"
      />
    </div>
  );
}
