"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";
import { ulid } from "ulid";

import { generateId } from "@pachi/utils";

import { setUserIdCookie } from "~/app/_actions/set-cookie";
import { Button } from "~/components/atoms/button";
import { ReplicacheInstancesStore } from "~/zustand/replicache";

interface DashboardButtonProps {
  username: string | undefined;
}
export function DashboardButton({ username }: DashboardButtonProps) {
  const router = useRouter();
  const globalRep = ReplicacheInstancesStore((state) => state.globalRep);
  const onClick = useCallback(async () => {
    const store_id = localStorage.getItem("store_id");
    if (store_id)
      return router.push(`/dashboard/products?store_id=${store_id}`);
    if (username)
      return router.push(`/dashboard/products?store_id=${username}`);

    if (!username) {
      const user_id = localStorage.getItem("user_id");
      if (user_id) {
        console.log("yes to user_id");
        return router.push(`/dashboard/products?store_id=${user_id}`);
      } else {
        const new_id = generateId({ prefix: "unauthenticated", id: ulid() });
        const new_store_id = generateId({ prefix: "store", id: new_id });
        console.log("creating new store");
        await globalRep?.mutate.createStore({
          args: {
            store: {
              id: new_store_id,
              created_at: new Date().toISOString(),
              name: "My Store",
              version: 1,
            },
          },
        });
        localStorage.setItem("user_id", new_id);
        localStorage.setItem("store_id", new_store_id);
        await setUserIdCookie(new_id);
        router.push(`/dashboard/products?store_id=${new_store_id}`);
      }
    }
  }, [globalRep, username, router]);

  return (
    <Button size="sm" onClick={onClick}>
      <Flame className="mr-1 text-white" size={15} />
      Dashboard
      <span className="sr-only">Dashboard</span>
    </Button>
  );
}
