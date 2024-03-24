import DotIndicator from "../ui/dot-indicator";

export const PaymentStatus = ({
  status,
}: {
  status: "captured" | "canceled" | "refunded";
}) => {
  switch (status) {
    case "captured":
      return <DotIndicator title="Paid" variant="success" />;
    case "canceled":
      return <DotIndicator title="Canceled" variant="danger" />;
    case "refunded":
      return <DotIndicator title="Refunded" variant="success" />;
    default:
      return null;
  }
};
