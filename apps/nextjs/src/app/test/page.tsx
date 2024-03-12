/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { toast as sonnerToast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Icons } from "~/components/ui/icons";
import { testApi } from "../_actions/test/test-api";

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
  type: Awaited<ReturnType<typeof testApi>>["type"];
}

export default function UsernamePage() {
  const initialState: UsernameFormState = {
    username: "",
    type: "NONE",
  };
  const [state, formAction] = useFormState(testApi, initialState);

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
          <h3 className="prone text-md mb-4 font-bold ">TEST API</h3>
        </CardHeader>
        <CardContent>
          <form className="grid w-full" action={formAction}>
            <div className="flex w-full justify-end pt-4">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
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
