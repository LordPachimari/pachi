"use client";

import { useEffect } from "react";
import { Replicache } from "replicache";

import { ClientDashboardMutators } from "@pachi/core";

import { env } from "~/env.mjs";
import { ReplicacheInstancesStore } from "~/zustand/replicache";

function DashboardReplicacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dashboardRep = ReplicacheInstancesStore((state) => state.dashboardRep);
  const setDashboardRep = ReplicacheInstancesStore(
    (state) => state.setDashboardRep,
  );
  const userId = "user1";
  useEffect(() => {
    if (dashboardRep) {
      return;
    }

    if (!userId) return;
    const r = new Replicache({
      name: userId,
      licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
      pushURL: `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/push/dashboard?userId=${userId}`,
      pullURL: `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/pull/dashboard?userId=${userId}`,
      mutators: ClientDashboardMutators,
      pullInterval: null,
    });
    setDashboardRep(r);
  }, [userId, dashboardRep, setDashboardRep]);
  return <>{children}</>;
}

export { DashboardReplicacheProvider };
