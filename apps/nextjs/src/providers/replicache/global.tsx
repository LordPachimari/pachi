"use client";

import { useEffect } from "react";
import { Replicache } from "replicache";

import { ClientGlobalMutators } from "@pachi/core";

import { env } from "~/env.mjs";
import { ReplicacheInstancesStore } from "~/zustand/replicache";

function GlobalReplicacheProvider({ children }: { children: React.ReactNode }) {
  const userId = "user1";
  const globalRep = ReplicacheInstancesStore((state) => state.globalRep);
  const setGlobalRep = ReplicacheInstancesStore((state) => state.setGlobalRep);
  useEffect(() => {
    if (globalRep) {
      return;
    }

    if (!userId) return;
    const r = new Replicache({
      name: userId,
      licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
      pushURL: `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/push/global?userId=${userId}`,
      pullURL: `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/pull/global?userId=${userId}`,
      mutators: ClientGlobalMutators,
      pullInterval: null,
    });
    setGlobalRep(r);
  }, [userId, globalRep, setGlobalRep]);
  return <>{children}</>;
}

export { GlobalReplicacheProvider };
