"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Flame, LayoutDashboard } from "lucide-react";
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
    console.log("on click store_id", store_id);
    console.log("on click username", username);
    if (store_id)
      return router.push(`/dashboard/products?store_id=${store_id}`);
    if (username)
      return router.push(`/dashboard/products?store_id=${username}`);
    if (username && !store_id) localStorage.setItem("store_id", username);

    if (!username) {
      const user_id = localStorage.getItem("user_id");
      if (user_id) {
        console.log("yes to user_id");
        return router.push(`/dashboard/products?store_id=${user_id}`);
      } else {
        const new_id = generateId({ prefix: "unauthenticated", id: ulid() });
        const new_store_id = generateId({ prefix: "store", id: new_id });
        console.log("creating new user");
        await globalRep?.mutate.createUser({
          args: {
            user: {
              id: new_id,
              created_at: new Date().toISOString(),
              username: new_id,
              version: 1,
              email: new_id,
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

      <button onClick={onClick} className="group flex h-18 w-18 flex-col items-center justify-center text-sm   ">
        <LayoutDashboard  className="text-slate-11 group-hover:text-slate-9" />
        <p className="text-[10px] text-slate-11 group-hover:text-slate-9">
          Dashboard
        </p>
      </button>
  );
}
