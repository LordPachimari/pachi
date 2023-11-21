/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import React, { useEffect, useState } from "react";
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
  const [userIdState, setUserIdState] = useState<string>(userId ?? "");
  useEffect(() => {
    if (!userId) {
      const user_id = localStorage.getItem("user_id");
      if (user_id) setUserIdState(user_id);
    }
  }, [userId]);
  React.useEffect(() => {
    if (rep) {
      return;
    }

    const r = new Replicache({
      name: `dashboard/${userIdState}`,
      licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
      pushURL: `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/push/dashboard?userId=${userIdState}`,
      pullURL: `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/pull/dashboard?userId=${userIdState}`,
      mutators: dashboardMutators,
      pullInterval: null,

      // logLevel: "debug",
    });

    setRep(r);
  }, [rep, setRep, userId]);
  return <></>;
}
