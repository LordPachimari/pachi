"use client";

import React from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  React.useEffect(() => {
    if (rep) {
      return;
    }
    if (!userId) return router.push(`/login`);
    const r = new Replicache({
      name: `dashboard/${userId}`,
      licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
      pushURL: `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/push/dashboard?userId=${userId}`,
      pullURL: `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/pull/dashboard?userId=${userId}`,
      mutators: dashboardMutators,
      pullInterval: null,

      // logLevel: "debug",
    });

    setRep(r);
  }, [rep, setRep, userId]);
  return <></>;
}
