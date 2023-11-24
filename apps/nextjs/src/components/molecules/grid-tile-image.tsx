import Image from "next/image";

import { cn } from "@pachi/utils";

import PriceLabel from "./price-label";

export function GridTileImage({
  isInteractive = true,
  active,
  label,
  ...props
}: {
  isInteractive?: boolean;
  active?: boolean;
  label?: {
    title: string;
    amount: number;
    currencyCode: string;
    position?: "bottom" | "center";
  };
} & React.ComponentProps<typeof Image>) {
  return (
    <div
      className={cn(
        "group flex h-full max-h-[300px] w-full max-w-[300px] items-center justify-center overflow-hidden rounded-lg border bg-white hover:border-blue-600 dark:bg-black",
        {
          relative: label,
          "border-2 border-blue-600": active,
          "border-neutral-200 dark:border-neutral-800": !active,
        },
      )}
    >
      {props.src ? (
        <Image
          className={cn("relative h-full w-full object-contain", {
            "transition duration-300 ease-in-out group-hover:scale-105":
              isInteractive,
          })}
          {...props}
        />
      ) : null}
      {label ? (
        <PriceLabel
          title={label.title}
          amount={label.amount}
          currencyCode={label.currencyCode}
          position={label.position ?? "bottom"}
        />
      ) : null}
    </div>
  );
}
