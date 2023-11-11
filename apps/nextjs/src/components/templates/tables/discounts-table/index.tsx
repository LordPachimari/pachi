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

// import type { Customer, Discount, Order, ProductVariant, User } from "@pachi/db";

// import { DataTable } from "~/components/organisms/data-table/data-table";

// interface DiscountsTableProps {
//   data: Discount[];
// }

// export function DiscountsTable({ data }: DiscountsTableProps) {
//   // Memoize the columns so they don't re-render on every render
//   const columns = React.useMemo<ColumnDef<Discount, unknown>[]>(
//     () => [
//       {
//         accessorKey: "Code",

//         header: ({ column }) => <h3 className="text-md ">Code</h3>,
//         cell: ({ row }) => (
//           <div className="w-[80px]">{row.getValue("code")}</div>
//         ),
//         enableSorting: false,
//         enableHiding: false,
//       },
//       {
//         accessorKey: "Description",

//         header: ({ column }) => <h3 className="text-md ">Description</h3>,
//         cell: ({ row }) => (
//           <div className="w-[80px]">{row.getValue("description")}</div>
//         ),
//         enableSorting: false,
//         enableHiding: false,
//       },
//       {
//         accessorKey: "Amount",
//         header: ({ column }) => <h3 className="text-md ">Amount</h3>,

//         cell: ({ row }) => {
//           return <div className="w-[80px]">{row.getValue("amount")}</div>;
//         },
//       },
//       {
//         accessorKey: "Orders",

//         header: ({ column }) => <h3 className="text-md ">Status</h3>,
//         cell: ({ row }) => {
//           return <div className="w-[80px]">{row.getValue("status")}</div>;
//         },
//         enableSorting: false,
//         enableHiding: true,
//       },

//       {
//         accessorKey: "Redemptions",
//         header: ({ column }) => <h3 className="text-md ">Redemptions</h3>,
//         cell: ({ row }) => (
//           <div className="w-[80px]">{row.getValue("redemptions")}</div>
//         ),
//         enableSorting: false,
//         enableHiding: true,
//       },
//     ],
//     [],
//   );

//   return <DataTable columns={columns} data={data} view={"row"} />;
// }
