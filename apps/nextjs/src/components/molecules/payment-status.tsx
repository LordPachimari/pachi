import type { PaymentStatus as PaymentStatusType } from "@pachi/db"

import DotIndicator from "../ui/dot-indicator"

export const PaymentStatus = ({ status }: { status: PaymentStatusType }) => {
  switch (status) {
    case "captured":
      return <DotIndicator title="Paid" variant="success" />
    case "canceled":
      return <DotIndicator title="Canceled" variant="danger" />
    case "partiallyRefunded":
      return <DotIndicator title="Requires Action" variant="danger" />
    case "refunded":
      return <DotIndicator title="Refunded" variant="success" />
    default:
      return null
  }
}
