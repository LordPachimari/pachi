import type { FulfillmentStatus as FulfillmentStatusType } from "@pachi/db";

import DotIndicator from "../ui/dot-indicator";

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
    case "partiallyFulfilled":
      return <DotIndicator title="Partially fulfilled" variant="warning" />;
    case "requiresAction":
      return <DotIndicator title="Requires Action" variant="danger" />;
    case "notFulfilled":
      return <DotIndicator title="Awaiting fulfillment" variant="danger" />;
    case "partiallyShipped":
      return <DotIndicator title="Partially Shipped" variant="warning" />;
    default:
      return null;
  }
};
