"use client";

import React, { useEffect, useState } from "react";
import { Replicache } from "replicache";

import { globalMutators } from "@pachi/api";

import { env } from "~/env.mjs";
import { ReplicacheInstancesStore } from "~/zustand/replicache";

interface GlobalRepProps {
  userId: string | undefined;
}
export default function GlobalRep({ userId }: GlobalRepProps) {
  const rep = ReplicacheInstancesStore((state) => state.globalRep);
  const setRep = ReplicacheInstancesStore((state) => state.setGlobalRep);
  const [userIdState, setUserIdState] = useState<string>(userId ?? "");
  useEffect(() => {
    console.log("userId from global rep", userId);
    if (!userId) {
      const user_id = localStorage.getItem("user_id");
      if (user_id) setUserIdState(user_id);
    }
    if (userId && !userIdState) setUserIdState(userId);
  }, [userId, userIdState]);
  console.log("userIdState", userIdState);

  React.useEffect(() => {
    if (rep) {
      return;
    }
    const r = new Replicache({
      name: userId ?? "unauthenticated",
      licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
      pushURL: `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/push/global?userId=${userIdState}`,
      pullURL: `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/pull/global?userId=${userIdState}`,
      mutators: globalMutators,
      pullInterval: null,
    });

    setRep(r);
  }, [userId, rep, setRep, userIdState]);
  return <></>;
}
