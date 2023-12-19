"use client";

import * as React from "react";
import * as Primitives from "@radix-ui/react-checkbox";
import { CheckIcon, MinusIcon } from "@radix-ui/react-icons";

import { cn } from "@pachi/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof Primitives.Root>,
  React.ComponentPropsWithoutRef<typeof Primitives.Root>
>(({ className, checked, ...props }, ref) => {
  return (
    //@ts-ignore
    <Primitives.Root
      {...props}
      ref={ref}
      checked={checked}
      className={cn(
        "group relative inline-flex h-5 w-5 items-center justify-center outline-none ",
        className,
      )}
    >
      <div className="group-hover:shadow-borders-strong-with-shadow group-data-[state=indeterminate]:shadow-input-borders h-[14px] w-[14px] rounded-[3px] bg-ui-bg-base text-ui-fg-on-inverted shadow-borders-base-with-shadow transition-all group-focus:!shadow-borders-interactive-with-focus group-disabled:!bg-ui-bg-disabled group-disabled:text-ui-fg-disabled group-disabled:!shadow-borders-base group-data-[state=checked]:bg-brand group-data-[state=indeterminate]:bg-brand group-data-[state=checked]:shadow-borders-base [&_path]:shadow-details-contrast-on-bg-interactive">
        <Primitives.Indicator className=" inset-0">
          {checked === "indeterminate" ? (
            <MinusIcon fontSize={4} />
          ) : (
            <CheckIcon fontSize={4} />
          )}
        </Primitives.Indicator>
      </div>
    </Primitives.Root>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
