/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import Primitive from "react-currency-input-field"

import { cn } from "@pachi/utils"

const currencyInputVariants = cva(
  cn(
    "flex items-center gap-x-1",
    "bg-slate-1 hover:bg-slate-2 border-ui-border-base shadow-buttons-neutral placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full rounded-md border",
    "focus-within:border-brand focus-within:shadow-input-shadow",
  ),
  {
    variants: {
      size: {
        base: "txt-compact-medium h-10 px-3",
        small: "txt-compact-small h-8 px-2",
      },
    },
    defaultVariants: {
      size: "base",
    },
  },
)

interface CurrencyInputProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof Primitive>,
      "prefix" | "suffix" | "size"
    >,
    VariantProps<typeof currencyInputVariants> {
  symbol: string
  code: string
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      size = "base",
      symbol,
      code,
      disabled = false,
      onInvalid,
      className,
      ...props
    },
    ref,
  ) => {
    const innerRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(
      ref,
      () => innerRef.current,
    )

    const [valid, setValid] = React.useState(true)

    const onInnerInvalid = React.useCallback(
      (event: React.FormEvent<HTMLInputElement>) => {
        setValid(event.currentTarget.validity.valid)

        if (onInvalid) {
          onInvalid(event)
        }
      },
      [onInvalid],
    )

    return (
      <div
        onClick={() => {
          if (innerRef.current) {
            innerRef.current.focus()
          }
        }}
        className={cn(
          "w-full cursor-text justify-between overflow-hidden",
          currencyInputVariants({ size }),
          {
            "cursor-not-allowed !border-ui-border-base !bg-ui-bg-disabled text-ui-fg-disabled placeholder-ui-fg-disabled !shadow-none":
              disabled,
            "border-ui-border-error focus-within:!shadow-borders-error invalid:focus:!shadow-borders-error":
              props["aria-invalid"] ?? !valid,
          },
          className,
        )}
      >
        <span
          className={cn("w-fit", {
            "py-[9px]": size === "base",
            "py-[5px]": size === "small",
          })}
          role="presentation"
        >
          <p className="pointer-events-none select-none uppercase text-ui-fg-muted">
            {code}
          </p>
        </span>
        <Primitive
          className="h-full min-w-0 flex-1 appearance-none bg-transparent text-right outline-none"
          disabled={disabled}
          onInvalid={onInnerInvalid}
          ref={innerRef}
          {...props}
        />
        <span
          className={cn("w-fit min-w-[16px] text-right", {
            "py-[9px]": size === "base",
            "py-[5px]": size === "small",
          })}
          role="presentation"
        >
          <p className="pointer-events-none select-none text-ui-fg-muted">
            {symbol}
          </p>
        </span>
      </div>
    )
  },
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
