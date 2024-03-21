"use client";

import { useState } from "react";

import type { UpdateProduct } from "@pachi/validators";

import InputField from "~/components/molecules/input-field";
import InputHeader from "~/components/molecules/input-header";
import type { DebouncedFunc } from "~/types";

interface OrganizeProps {
  productId: string;
  onInputChange: DebouncedFunc<
    (updates: UpdateProduct["updates"]) => Promise<void>
  >;
}

export default function Organize({ onInputChange }: OrganizeProps) {
  return (
    <div className="flex w-full flex-col gap-2 px-4 pb-2 pt-0">
      <InputField label="Product category" />
      <InputField
        label="Product type"
        onChange={(e) =>
          onInputChange({
            type: e.target.value,
          })
        }
      />
      {/* <InputField label="Product collection" /> */}
      <InputHeader label="Product tags" />
      {/* <TagInput
        values={tags}
        onChange={async (values) => {
          setTags(values as string[]);
          // await onTagsChange(values as string[]);
        }}
        className="w-full"
        placeholder="product tags"
      /> */}
    </div>
  );
}
