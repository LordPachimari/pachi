// "use client";

// import { useState } from "react";

// import type { Order, User } from "@pachi/db";

// import { Shell } from "~/components/atoms/shell";
// import BackButton from "~/components/molecules/back-button";
// import CustomerNote from "~/components/organisms/customer/customer-note";
// import CustomerSummary from "~/components/organisms/customer/customer-summary";
// import { OrdersTable } from "~/components/templates/tables/orders-table";

// const OrderDetails = ({ params }: { params: { id: string } }) => {
//   const { id } = params;
//   const testOrder: Order = {
//     id: "order1",
//     currency_code: "AUD",
//     items: [],
//     discounts: [],
//     gift_cards: [],
//     discount_total: 0,
//     gift_card_total: 0,
//     shipping_total: 0,
//     tax_total: 0,
//     subtotal: 0,
//     total: 0,
//     tax_rate: 0,
//     paid_total: 0,
//     refunded_total: 0,
//     payment_status: "awaiting",
//     payments: [],
//     status: "pending",
//     shipping_address: {
//       id: "AWdaw",
//       country_code: "AU",
//     },
//     fulfillment_status: "not_fulfilled",
//     fulfillments: [],
//     shipping_methods: [],
//     created_at: "2021-10-10",
//   };
//   const test_customer: User = {
//     id: "customer1",
//     orders: [testOrder],
//     user: {
//       username: "Pachimari",
//       id: "user1",
//     },
//     email: "awdawdawd@gmail.com",
//     created_at: "2021-10-10",
//   };
//   return (
//     <Shell className="flex w-full flex-col gap-0 ">
//       <div className="flex w-full max-w-7xl justify-start">
//         <BackButton
//           path="/dashboard/customers"
//           label="Back to Customers"
//           className="mb-xsmall"
//         />
//       </div>
//       <div className="w-full max-w-7xl justify-center gap-4 lg:flex">
//         <section className="mb-4 flex w-full max-w-[1020px] flex-col items-center gap-4 lg:w-8/12  ">
//           <OrdersTable data={[]} />
//         </section>

//         <section className="flex w-full max-w-[1020px] flex-col gap-4 lg:w-4/12">
//           {/* <Timeline orderId={order.id} /> */}
//           <CustomerSummary customer={test_customer} />
//           <CustomerNote customer_id={test_customer.id} />
//         </section>
//       </div>
//     </Shell>
//   );
// };

// export default OrderDetails;

export default function Page() {
  return <div></div>;
}
