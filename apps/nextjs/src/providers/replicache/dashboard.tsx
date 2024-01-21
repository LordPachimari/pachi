import { createContext, useContext, useEffect, useState } from "react";
import { Replicache } from "replicache";

import { client } from "@pachi/core";

import { env } from "~/env.mjs";

const ReplicacheDashboardContext = createContext<Replicache<ReturnType<typeof getMutators>> | undefined>(
  undefined,
);
function getMutators() {
    return client.initDashboardMutations().build();
}
function DashboardReplicacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const mutators = getMutators();
  const [dashboardRep, setDashboardRep] = useState<
    Replicache<typeof mutators> | undefined
  >(undefined);
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
      mutators,
      pullInterval: null,
    });
    setDashboardRep(r);
  }, [userId, dashboardRep, mutators]);
  return (
    <ReplicacheDashboardContext.Provider value={dashboardRep }>
      {children}
    </ReplicacheDashboardContext.Provider>
  );
}

function useDashboardRep() {
  const context = useContext(ReplicacheDashboardContext);
  if (context === undefined) {
    throw new Error(
      "useDashboardRep must be used within a DashboardReplicacheProvider",
    );
  }
  return context;
}
export { DashboardReplicacheProvider, ReplicacheDashboardContext, useDashboardRep };
