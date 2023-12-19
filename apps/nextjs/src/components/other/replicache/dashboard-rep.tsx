"use client";

import React from "react";
import { Replicache } from "replicache";

import { dashboardMutators } from "@pachi/api";

import { env } from "~/env.mjs";
import { ReplicacheInstancesStore } from "~/zustand/replicache";

interface DashboardRepProps {
  userId: string | undefined;
}
export default function DashboardRep({ userId }: DashboardRepProps) {
  const rep = ReplicacheInstancesStore((state) => state.dashboardRep);
  const setRep = ReplicacheInstancesStore((state) => state.setDashboardRep);
  React.useEffect(() => {
    if (rep) {
      return;
    }
    if (!userId) return;
    const r = new Replicache({
      name: `dashboard/${userId}`,
      licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
      pushURL: `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/push/dashboard`,
      pullURL: `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/pull/dashboard`,
      mutators: dashboardMutators,
      pullInterval: null,

      // logLevel: "debug",
    });

    setRep(r);
  }, [rep, setRep, userId]);
  return <></>;
}
