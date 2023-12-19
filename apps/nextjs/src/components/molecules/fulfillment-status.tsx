import type { FulfillmentStatus as FulfillmentStatusType } from "@pachi/db";

import DotIndicator from "../atoms/dot-indicator";

export const FulfillmentStatus = ({
  status,
}: {
  status: FulfillmentStatusType;
}) => {
  switch (status) {
    case "shipped":
      return <DotIndicator title="Shipped" variant="success" />;
    case "fulfilled":
      return <DotIndicator title="Fulfilled" variant="warning" />;
    case "partially_fulfilled":
      return <DotIndicator title="Partially fulfilled" variant="warning" />;
    case "requires_action":
      return <DotIndicator title="Requires Action" variant="danger" />;
    case "not_fulfilled":
      return <DotIndicator title="Awaiting fulfillment" variant="danger" />;
    case "partially_shipped":
      return <DotIndicator title="Partially Shipped" variant="warning" />;
    default:
      return null;
  }
};
