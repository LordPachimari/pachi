import { PageHeaderHeading } from "~/components/molecules/page-header";
import { Shell } from "~/components/ui/shell";

const OrdersOverview = () => {
  return (
    <Shell>
      <PageHeaderHeading size="sm" className="mt-2 flex-1">
        Orders
      </PageHeaderHeading>
      {/* <OrdersTable data={[]} /> */}
    </Shell>
  );
};

export default OrdersOverview;
