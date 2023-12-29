import type { OrderStatus as OrderStatusType } from "@pachi/db";

import DotIndicator from "../atoms/dot-indicator";

export const OrderStatus = ({ status }: { status: OrderStatusType }) => {
  switch (status) {
    case "completed":
      return <DotIndicator title="Completed" variant="success" />;
    case "pending" || "archived":
      return <DotIndicator title="Processing" variant="default" />;
    case "canceled":
      return <DotIndicator title="Canceled" variant="danger" />;
    case "requiresAction":
      return <DotIndicator title="Requires action" variant="danger" />;
    default:
      return null;
  }
};
