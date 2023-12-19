import { useEffect, useState } from "react";

import type { ProductOption } from "@pachi/db";

import { Input } from "~/components/atoms/input";
import TagInput from "~/components/molecules/tag-input";
import type { DebouncedFunc } from "~/types";

interface OptionProps {
  option: ProductOption;
  onNameChange: DebouncedFunc<(id: string, name: string) => Promise<void>>;
  onValuesChange: DebouncedFunc<
    (option_id: string, values: string[]) => Promise<void>
  >;
}
export default function Option({
  option,
  onNameChange,
  onValuesChange,
}: OptionProps) {
  console.log("option", option);
  const [values, setValues] = useState<string[]>([]);
  useEffect(() => {
    const values = option.values?.map((v) => v.value) ?? [];
    setValues(values);
  }, [option]);
  console.log("values initial", values);
  return (
    <div className="flex gap-2">
      <Input
        className="w-full md:w-[120px]"
        defaultValue={option.name ?? ""}
        placeholder="Size, color"
        onChange={async (e) => {
          console.log("option id", option.id);
          await onNameChange(option.id, e.target.value);
        }}
      />
      <TagInput
        values={values}
        onChange={async (values) => {
          setValues(values as string[]);
          await onValuesChange(option.id, values as string[]);
        }}
        className="w-full"
        placeholder="green, large, (comma separated)"
      />
    </div>
  );
}
