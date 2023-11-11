"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hanko, register } from "@teamhanko/hanko-elements";

const hankoApi = process.env["NEXT_PUBLIC_HANKO_API_URL"]!;

export default function HankoAuth() {
  const router = useRouter();

  const [hanko, setHanko] = useState<Hanko>();

  useEffect(() => {
    const hanko_ = new Hanko(hankoApi);
    setHanko(hanko_);
  }, []);

  const redirectAfterLogin = useCallback(() => {
    // successfully logged in, redirect to a page in your application
    router.replace("/home");
  }, [router]);

  useEffect(
    () =>
      hanko?.onAuthFlowCompleted(() => {
        redirectAfterLogin();
      }),
    [hanko, redirectAfterLogin],
  );

  useEffect(() => {
    register(hankoApi).catch((error) => {
      // handle error
      console.log(error);
    });
  }, []);

  return <hanko-auth />;
}
