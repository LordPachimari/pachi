// "use client";

// import * as React from "react";
// // import {
// //   ArrowDownIcon,
// //   ArrowRightIcon,
// //   ArrowUpIcon,
// //   CheckCircledIcon,
// //   CircleIcon,
// //   CrossCircledIcon,
// //   DotsHorizontalIcon,
// //   QuestionMarkCircledIcon,
// //   StopwatchIcon,
// // } from "@radix-ui/react-icons";
// import type { ColumnDef } from "@tanstack/react-table";

// import type { Order, ProductVariant, User } from "@pachi/db";

// import { DataTable } from "~/components/organisms/data-table/data-table";

// interface OrdersTableProps {
//   data: Order[];
// }

// export function OrdersTable({ data }: OrdersTableProps) {
//   // Memoize the columns so they don't re-render on every render
//   const columns = React.useMemo<ColumnDef<Order, unknown>[]>(
//     () => [
//       {
//         accessorKey: "Order",

//         header: ({ column }) => <h3 className="text-md ">Order</h3>,
//         cell: ({ row }) => (
//           <div className="w-[80px]">{row.getValue("name")}</div>
//         ),
//         enableSorting: false,
//         enableHiding: false,
//       },
//       {
//         accessorKey: "Date added",

//         header: ({ column }) => <h3 className="text-md ">Date added</h3>,
//         cell: ({ row }) => (
//           <div className="w-[80px]">{row.getValue("created_at")}</div>
//         ),
//         enableSorting: false,
//         enableHiding: false,
//       },
//       {
//         accessorKey: "Customer",
//         header: ({ column }) => <h3 className="text-md ">Customer</h3>,

//         cell: ({ row }) => {
//           return (
//             <div className="w-[80px]">
//               {(row.getValue("customer") as User).username || "Anonymous"}
//             </div>
//           );
//         },
//       },
//       {
//         accessorKey: "fulfillment status",

//         header: ({ column }) => <h3 className="text-md ">Fulfillment</h3>,
//         cell: ({ row }) => (
//           <div className="w-[80px]">{row.getValue("fulfillment_status")}</div>
//         ),
//         enableSorting: false,
//         enableHiding: true,
//       },

//       {
//         accessorKey: "Sales channel",
//         header: ({ column }) => <h3 className="text-md ">Sales channel</h3>,
//         cell: ({ row }) => (
//           <div className="w-[80px]">{row.getValue("sales_channels")}</div>
//         ),
//         enableSorting: false,
//         enableHiding: true,
//       },

//       {
//         accessorKey: "Total",
//         header: ({ column }) => <h3 className="text-md ">Total</h3>,
//         cell: ({ row }) => (
//           <div className="w-[80px]">{row.getValue("total")}</div>
//         ),
//         enableSorting: false,
//         enableHiding: true,
//       },
//     ],
//     [],
//   );

//   return <DataTable columns={columns} data={data} view={"row"} />;
// }
