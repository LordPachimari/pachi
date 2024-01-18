/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { toast as sonnerToast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Icons } from "~/components/ui/icons";
import { Input } from "~/components/ui/input";
import { createUser } from "../_actions/user/create-user";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="z-20 " disabled={pending} type="submit">
      {pending ? (
        <>
          <Icons.spinner className="h-3 w-3 animate-spin" aria-hidden="true" />
          {`Next`}
        </>
      ) : (
        <>Next</>
      )}
    </Button>
  );
}

interface UsernameFormState {
  username: string;
  type: Awaited<ReturnType<typeof createUser>>["type"];
}
export default function UsernamePage() {
  const initialState: UsernameFormState = {
    username: "",
    type: "NONE",
  };
  const [state, formAction] = useFormState(createUser, initialState);
  useEffect(() => {
    //@ts-ignore
    if (state.type === "FAIL") {
      //@ts-ignore
      toast.error(state.message);
    }
    //@ts-ignore
    if (state.type === "SUCCESS") {
      //@ts-ignore
      toast.success(state.message);
    }
  }, [state]);
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-red-50 dark:bg-slate-4">
      <Card className="h-fit w-full rounded-xl bg-white drop-shadow-md dark:border-[1px] dark:border-slate-6 dark:bg-slate-3 md:w-96">
        <CardHeader>
          <h3 className="prone text-md mb-4 font-bold ">Enter username</h3>
        </CardHeader>
        <CardContent>
          <form className="grid w-full" action={formAction}>
            <label className="sr-only" htmlFor="username">
              Username
            </label>
            <MyInput
              empty={
                (state as { type: UsernameFormState["type"] }).type ===
                "SUCCESS"
              }
            />
            <div className="flex w-full justify-end pt-4">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// TODO: Maybe use for naming something better instead of 'empty' to indicate the input should be cleared?
function MyInput({ empty }: { empty: boolean }) {
  const { pending } = useFormStatus();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (inputRef.current && empty) {
      inputRef.current.value = "";
      router.push("/home");
    }
  }, [empty, router]);

  return (
    <Input
      disabled={pending}
      id="username"
      name="username"
      placeholder="Username"
      className="w-full text-black dark:text-white"
      ref={inputRef}
    />
  );
}

// TODO: Move to a local lib/utils if used anywhere else
const toast = {
  error(message: string) {
    sonnerToast.error(message);
  },
  success(message: string) {
    sonnerToast.success(message);
  },
};
