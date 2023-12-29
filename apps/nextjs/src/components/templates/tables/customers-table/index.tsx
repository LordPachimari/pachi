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

// import type { Customer, Order, ProductVariant, User } from "@pachi/db";

// import { DataTable } from "~/components/organisms/data-table/data-table";

// interface CustomersTableProps {
//   data: Customer[];
// }

// export function CustomersTable({ data }: CustomersTableProps) {
//   // Memoize the columns so they don't re-render on every render
//   const columns = React.useMemo<ColumnDef<Customer, unknown>[]>(
//     () => [
//       {
//         accessorKey: "Date added",

//         header: ({ column }) => <h3 className="text-md ">Date added</h3>,
//         cell: ({ row }) => (
//           <div className="w-[80px]">{row.getValue("createdAt")}</div>
//         ),
//         enableSorting: false,
//         enableHiding: false,
//       },
//       {
//         accessorKey: "Name",

//         header: ({ column }) => <h3 className="text-md ">Name</h3>,
//         cell: ({ row }) => (
//           <div className="w-[80px]">{row.getValue("name")}</div>
//         ),
//         enableSorting: false,
//         enableHiding: false,
//       },
//       {
//         accessorKey: "Email",
//         header: ({ column }) => <h3 className="text-md ">Email</h3>,

//         cell: ({ row }) => {
//           return <div className="w-[80px]">{row.getValue("email")}</div>;
//         },
//       },
//       {
//         accessorKey: "Orders",

//         header: ({ column }) => <h3 className="text-md ">Fulfillment</h3>,
//         cell: ({ row }) => (
//           <div className="w-[80px]">
//             {(row.getValue("orders") as Order[]).length}
//           </div>
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
