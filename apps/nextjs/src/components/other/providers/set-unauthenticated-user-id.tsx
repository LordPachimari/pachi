import { useEffect } from "react";

import { generateId, ulid } from "@pachi/utils";

interface SetUnauthenticatedUserIdProps {
  userId: string | undefined;
}
export function SetUnauthenticatedUserId({
  userId,
}: SetUnauthenticatedUserIdProps) {
  useEffect(() => {
    if (!userId) {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        const new_id = generateId({ prefix: "user", id: ulid() });
        localStorage.setItem("userId", new_id);
      }
    }
  }, [userId]);
  return <></>;
}
