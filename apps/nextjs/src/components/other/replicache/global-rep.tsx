"use client";

import React from "react";
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

  React.useEffect(() => {
    if (rep) {
      return;
    }

    const r = new Replicache({
      name: userId ?? "unauthenticated",
      licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
      pushURL: `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/push/global${
        userId ? `?userId=${userId}` : ""
      }`,
      pullURL: `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/pull/global${
        userId ? `?userId=${userId}` : ""
      }`,
      mutators: globalMutators,
      pullInterval: null,
    });

    setRep(r);
  }, [userId, rep, setRep]);
  return <></>;
}