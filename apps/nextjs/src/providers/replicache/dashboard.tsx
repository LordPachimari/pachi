import { createContext, useEffect, useState } from "react";
import { Replicache } from "replicache";

import { client } from "@pachi/core";

import { env } from "~/env.mjs";

const ReplicacheDashboardContext = createContext<{
  dashboardRep: Replicache | undefined;
}>({
  dashboardRep: undefined,
});

function DashboardReplicacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const mutators = client.initDashboardMutations().build();
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
    <ReplicacheDashboardContext.Provider value={{ dashboardRep }}>
      {children}
    </ReplicacheDashboardContext.Provider>
  );
}
export { DashboardReplicacheProvider, ReplicacheDashboardContext };
