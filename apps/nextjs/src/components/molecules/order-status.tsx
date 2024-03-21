import DotIndicator from "../ui/dot-indicator";

export const OrderStatus = ({
  status,
}: {
  status: "completed" | "pending" | "canceled" | "archived";
}) => {
  switch (status) {
    case "completed":
      return <DotIndicator title="Completed" variant="success" />;
    case "pending" || "archived":
      return <DotIndicator title="Processing" variant="default" />;
    case "canceled":
      return <DotIndicator title="Canceled" variant="danger" />;
    default:
      return null;
  }
};
