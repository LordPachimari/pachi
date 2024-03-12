import React from "react";
import { Cross1Icon } from "@radix-ui/react-icons";

import { Action, type ActionProps } from "../Action";

export function Remove(props: ActionProps) {
  return (
    <Action
      {...props}
      active={{
        fill: "rgba(255, 70, 70, 0.95)",
        background: "rgba(255, 70, 70, 0.1)",
      }}
    >
      <Cross1Icon className="text-red-500 dark:text-red-500" />
    </Action>
  );
}
