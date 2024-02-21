/* eslint-disable react/no-children-prop */
"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { toast } from "sonner";
import * as z from "zod";

import { cn } from "@pachi/utils";

import { Button, buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { env } from "~/env.mjs";

const userAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
type UserAuthSchema = z.infer<typeof userAuthSchema>;

export function UserAuthForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value, formApi }) => {
      console.log("value", value);
    },
    validatorAdapter: zodValidator,
  });

  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const searchParams = useSearchParams();

  async function onSubmit({ value }: { value: UserAuthSchema }) {
    const registerEffect = fetch(
      `${
        env.VERCEL_URL === "local"
          ? env.NEXT_PUBLIC_WORKER_LOCAL_URL
          : env.NEXT_PUBLIC_WORKER_DEV_URL
      }`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          email: value.email,
          password: value.password,
        }),
      },
    )
      .then((res) => res.json())
      .then((data) => {
        return z
          .object({
            type: z.enum(["SUCCESS", "FAIL"] as const),
            message: z.string(),
          })
          .parse(data);
      });
    const { message, type } = React.use(registerEffect);
    if (type === "FAIL") {
      toast.error(message);
    } else {
      toast.success(message);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form.Provider>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <div className="grid gap-2">
            <form.Field
              name="email"
              validators={{
                onChange: z
                  .string()
                  .min(3, "Password must be at least 3 characters"),
              }}
              children={({ form, name, state }) => {
                console.log("errors", state.meta.touchedErrors);
                return (
                  <>
                    <Label className="sr-only" htmlFor="email">
                      Email
                    </Label>
                    <Input
                      id={name}
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={form.state.isSubmitting}
                    />
                    {state.meta.touchedErrors && (
                      <p className="px-1 text-xs text-red-600">
                        {state.meta.touchedErrors}
                      </p>
                    )}
                  </>
                );
              }}
            />
          </div>
          <div className="grid gap-2">
            <form.Field
              name="password"
              children={({ form, name, state }) => {
                return (
                  <>
                    <Label className="sr-only" htmlFor="email">
                      Password
                    </Label>
                    <Input
                      id={name}
                      placeholder="password"
                      type="password"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={form.state.isSubmitting}
                      className={cn({
                        "border-red-500":
                          state.meta.touchedErrors.length > 0 &&
                          state.meta.touchedErrors,
                      })}
                    />
                    {state.meta.touchedErrors && (
                      <p className="px-1 text-xs text-red-600">
                        {state.meta.touchedErrors}
                      </p>
                    )}
                  </>
                );
              }}
            />
          </div>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                variant={"outline"}
                type="submit"
                className="w-full"
                onClick={() => {
                  setIsGoogleLoading(true);
                }}
                disabled={isSubmitting ?? isGoogleLoading}
              >
                Enter
              </Button>
            )}
          />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 py-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                variant={"outline"}
                type="button"
                className="w-full"
                onClick={() => {
                  setIsGoogleLoading(true);
                }}
                disabled={isSubmitting ?? isGoogleLoading}
              >
                Google
              </Button>
            )}
          />
        </form>
      </form.Provider>
    </div>
  );
}
