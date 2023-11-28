"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { ProductOption, ProductVariant } from "@pachi/db";
import { cn, mapOptionIds } from "@pachi/utils";

import { createUrl } from "~/libs/create-url";

type Combination = {
  id: string;
  availableForSale: boolean;
  [key: string]: string | boolean; // ie. { color: 'Red', size: 'Large', ... }
};
export function VariantSelector({
  options,
  variants,
}: {
  options: ProductOption[];
  variants: ProductVariant[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasNoOptionsOrJustOneOption =
    !options.length ||
    (options.length === 1 && options[0]?.values!.length === 1);

  if (hasNoOptionsOrJustOneOption) {
    return null;
  }
  if (options.length === 0) {
    return <></>;
  }
  const combinations: Combination[] = variants.map((variant) => ({
    id: variant.id,
    availableForSale: variant.available ?? true,
    // Adds key / value pairs for each variant (ie. "color": "Black" and "size": 'M").
    ...variant.options!.reduce(
      (accumulator, option) => ({
        ...accumulator,
        [option.option_name.toLowerCase()]: option.value,
      }),
      {},
    ),
  }));

  return options.map((option) => (
    <dl className="mb-8" key={option.id}>
      <dt className="mb-4 text-sm uppercase tracking-wide">{option.name}</dt>
      <dd className="flex flex-wrap gap-3">
        {option.values!.map((optionValue) => {
          const optionNameLowerCase = option.name.toLowerCase();

          // Base option params on current params so we can preserve any other param state in the url.
          const optionSearchParams = new URLSearchParams(
            searchParams.toString(),
          );

          // Update the option params using the current option to reflect how the url *would* change,
          // if the option was clicked.
          optionSearchParams.set(optionNameLowerCase, optionValue.value);
          const optionUrl = createUrl(pathname, optionSearchParams);

          // In order to determine if an option is available for sale, we need to:
          //
          // 1. Filter out all other param state
          // 2. Filter out invalid options
          // 3. Check if the option combination is available for sale
          //
          // This is the "magic" that will cross check possible variant combinations and preemptively
          // disable combinations that are not available. For example, if the color gray is only available in size medium,
          // then all other sizes should be disabled.
          const filtered = Array.from(optionSearchParams.entries()).filter(
            ([key, value]) =>
              options.find(
                (option) =>
                  option.name.toLowerCase() === key &&
                  option.values!.findIndex(
                    (optionValue) => optionValue.value === value,
                  ) !== -1,
              ),
          );
          const isAvailableForSale = combinations.find((combination) =>
            filtered.every(
              ([key, value]) =>
                combination[key] === value && combination.availableForSale,
            ),
          );

          // The option is active if it's in the url params.
          const isActive =
            searchParams.get(optionNameLowerCase) === optionValue.value;

          // You can't disable a link, so we need to render something that isn't clickable.
          const DynamicTag = isAvailableForSale ? Link : "p";
          const dynamicProps = {
            ...(isAvailableForSale && { scroll: false }),
          };

          return (
            <DynamicTag
              key={optionValue.value}
              aria-disabled={!isAvailableForSale}
              href={optionUrl}
              title={`${option.name} ${optionValue.value}${
                !isAvailableForSale ? " (Out of Stock)" : ""
              }`}
              className={cn(
                "flex min-w-[48px] items-center justify-center rounded-full border bg-neutral-100 px-2 py-1 text-sm dark:border-neutral-800 dark:bg-neutral-900",
                {
                  "cursor-default ring-2 ring-black": isActive,
                  "ring-1 ring-transparent transition duration-300 ease-in-out hover:scale-110 hover:ring-black ":
                    !isActive && isAvailableForSale,
                  "relative z-10 cursor-not-allowed overflow-hidden bg-neutral-100 text-slate-8 ring-1 ring-slate-5 before:absolute before:inset-x-0 before:-z-10 before:h-px before:-rotate-45 before:bg-neutral-300 before:transition-transform dark:bg-neutral-900 ":
                    !isAvailableForSale,
                },
              )}
              {...dynamicProps}
            >
              {optionValue.value}
            </DynamicTag>
          );
        })}
      </dd>
    </dl>
  ));
}
