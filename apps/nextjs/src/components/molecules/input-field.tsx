import type {
  ChangeEventHandler,
  FocusEventHandler,
  MouseEventHandler,
} from "react";
import React, { useImperativeHandle, useRef } from "react";

import { cn } from "@pachi/utils";

import { Input } from "../ui/input";
import type { InputHeaderProps } from "./input-header";
import InputHeader from "./input-header";

export type InputProps = Omit<React.ComponentPropsWithRef<"input">, "prefix"> &
  InputHeaderProps & {
    small?: boolean;
    label?: string;
    onDelete?: MouseEventHandler<HTMLSpanElement>;
    onChange?: ChangeEventHandler<HTMLInputElement>;
    onFocus?: FocusEventHandler<HTMLInputElement>;
    errors?: Record<string, unknown>;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    props?: React.HTMLAttributes<HTMLDivElement>;
  };

const InputField = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      small,
      placeholder,
      label,
      name,
      required,
      onDelete,
      onChange,
      onFocus,
      tooltipContent,
      tooltip,
      prefix,
      suffix,
      errors,
      props,
      className,
      size,
      ...fieldProps
    }: InputProps,
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(
      ref,
      () => inputRef.current,
    );

    return (
      <div
        className={cn("flex w-full flex-col justify-between", className)}
        {...props}
      >
        {label && (
          <InputHeader {...{ label, required, tooltipContent, tooltip }} />
        )}
        <Input
          ref={inputRef}
          autoComplete="off"
          name={name}
          placeholder={placeholder ?? `${label}...` ?? "Placeholder"}
          onChange={onChange}
          onFocus={onFocus}
          required={required}
          {...fieldProps}
        />
        {/* <InputError name={name} errors={errors} /> */}
      </div>
    );
  },
);

InputField.displayName = "InputField";

export default InputField;
