import { createContext, useEffect, useState } from "react";
import { Replicache } from "replicache";

import { client } from "@pachi/core";

import { env } from "~/env.mjs";

const ReplicacheGlobalContext = createContext<{
  globalRep: Replicache | undefined;
}>({
  globalRep: undefined,
});

function GlobalReplicacheProvider({ children }: { children: React.ReactNode }) {
  const [globalRep, setGlobalRep] = useState<Replicache | undefined>(undefined);
  const userId = "user1";
  const mutators = client.initGlobalMutations().build();
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
      mutators,
      pullInterval: null,
    });
    setGlobalRep(r);
  }, [userId, globalRep, mutators]);
  return (
    <ReplicacheGlobalContext.Provider value={{ globalRep }}>
      {children}
    </ReplicacheGlobalContext.Provider>
  );
}
export { GlobalReplicacheProvider, ReplicacheGlobalContext };
