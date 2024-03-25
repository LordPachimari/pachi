"use client";

import type { LuciaUser } from "@pachi/auth";

import { Button } from "~/components/ui/button";

function DashboardButton({ user }: { user: LuciaUser | null }) {
  if (user) return <Button href={"/dashboard"}>Dashboard</Button>;

  return <Button href={"/login"}>Dashboard</Button>;
}

export { DashboardButton };
