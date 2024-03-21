"use client";

import { useEffect } from "react";
import { Replicache } from "replicache";

import { DashboardMutators } from "@pachi/core";

import { env } from "~/env.mjs";
import { useReplicache } from "~/zustand/replicache";

function DashboardReplicacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dashboardRep, setDashboardRep } = useReplicache();
  const userID = "user1";

  useEffect(() => {
    if (dashboardRep) {
      return;
    }

    if (!userID) return;
    const r = new Replicache({
      name: userID,
      licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
      pushURL: `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/push/dashboard?userID=${userID}`,
      pullURL: `${env.NEXT_PUBLIC_WORKER_LOCAL_URL}/pull/dashboard?userID=${userID}`,
      mutators: DashboardMutators,
      pullInterval: null,
    });
    setDashboardRep(r);
  }, [userID, dashboardRep, setDashboardRep]);

  return <>{children}</>;
}

export { DashboardReplicacheProvider };
