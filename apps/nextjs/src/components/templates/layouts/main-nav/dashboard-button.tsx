"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "lucide-react";

import { ReplicacheInstancesStore } from "~/zustand/replicache";

interface DashboardButtonProps {
  username: string | undefined;
}
export function DashboardButton({ username }: DashboardButtonProps) {
  const router = useRouter();
  const globalRep = ReplicacheInstancesStore((state) => state.globalRep);
  const onClick = useCallback(() => {
    router.push(`/dashboard/products?storeId=${username}`);
  }, [ username, router]);

  return (
    <button
      onClick={onClick}
      className="group flex h-18 w-18 flex-col items-center justify-center text-sm   "
    >
      <LayoutDashboard className="text-slate-11 group-hover:text-slate-9" />
      <p className="text-[10px] text-slate-11 group-hover:text-slate-9">
        Dashboard
      </p>
    </button>
  );
}
