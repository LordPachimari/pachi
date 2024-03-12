"use client";

import { useEffect, useState } from "react";

import type { ProductTag, ProductUpdates } from "@pachi/db";

import InputField from "~/components/molecules/input-field";
import InputHeader from "~/components/molecules/input-header";
import type { DebouncedFunc } from "~/types";

interface OrganizeProps {
  productId: string;
  onInputChange: DebouncedFunc<
    ({ updates }: { updates: ProductUpdates }) => Promise<void>
  >;
  productTags: ProductTag[];
}

export default function Organize({
  productId,
  onInputChange,
  productTags,
}: OrganizeProps) {
  const [tags, setTags] = useState<string[]>([]);

  //TODO: fix this
  // const onTagsChange = useCallback(
  //   debounce(async (tags: string[]) => {
  //     await dashboardRep?.mutate.updateProductTags({
  //       args: {
  //         productId,
  //         tags,
  //       },
  //     });
  //   }, 500),
  //   [dashboardRep, productId],
  // );
  useEffect(() => {
    const tags = productTags.map((t) => t.value) ?? [];
    setTags(tags);
  }, [productTags]);

  return (
    <div className="flex w-full flex-col gap-2 px-4 pb-2 pt-0">
      <InputField label="Product category" />
      <InputField
        label="Product type"
        onChange={(e) =>
          onInputChange({
            updates: {
              type: e.target.value,
            },
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
