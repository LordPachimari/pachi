import { useEffect } from "react";

import { generateId, ulid } from "@pachi/utils";

interface SetUnauthenticatedUserIdProps {
  user_id: string | undefined;
}
export function SetUnauthenticatedUserId({
  user_id,
}: SetUnauthenticatedUserIdProps) {
  useEffect(() => {
    if (!user_id) {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        const new_id = generateId({ prefix: "user", id: ulid() });
        localStorage.setItem("user_id", new_id);
      }
    }
  }, [user_id]);
  return <></>;
}
