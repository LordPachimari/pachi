import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
} from "@radix-ui/react-icons";
import type { Column } from "@tanstack/react-table";

import { cn } from "@pachi/utils";

import { Button } from "~/components/atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/atoms/dropdown-menu";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* {title.toLocaleLowerCase() === "status" && tableType === "product" ? (
        <StatusDropdown column={column} title={title} />
      ) : ( */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={
              column.getIsSorted() === "desc"
                ? `Sorted descending. Click to sort ascending.`
                : column.getIsSorted() === "asc"
                ? `Sorted ascending. Click to sort descending.`
                : `Not sorted. Click to sort ascending.`
            }
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span className="text-base">{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" aria-hidden="true" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" aria-hidden="true" />
            ) : (
              <CaretSortIcon className="ml-2 h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            aria-label="Sort ascending"
            onClick={() => column.toggleSorting(false)}
          >
            <ArrowUpIcon
              className="mr-2 h-3.5 w-3.5 text-muted-foreground/70"
              aria-hidden="true"
            />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label="Sort descending"
            onClick={() => column.toggleSorting(true)}
          >
            <ArrowDownIcon
              className="mr-2 h-3.5 w-3.5 text-muted-foreground/70"
              aria-hidden="true"
            />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            aria-label="Hide column"
            onClick={() => column.toggleVisibility(false)}
          >
            <EyeNoneIcon
              className="mr-2 h-3.5 w-3.5 text-muted-foreground/70"
              aria-hidden="true"
            />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* )} */}
    </div>
  );
}
// interface StatusProps<TData, TValue>
//   extends React.HTMLAttributes<HTMLDivElement> {
//   column: Column<TData, TValue>;
//   title: string;
// }

// function StatusDropdown<TData, TValue>({
//   column,
//   title,
// }: StatusProps<TData, TValue>) {
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="ghost"
//           size="sm"
//           className="data-[state=open]:bg-accent -ml-3 h-8"
//         >
//           <span className="text-base">{title}</span>
//           <CaretSortIcon className="ml-2 h-4 w-4" aria-hidden="true" />
//         </Button>
//       </DropdownMenuTrigger>

//       <DropdownMenuContent align="start">
//         {product_status.map((status) => {
//           if (status === "draft")
//             return (
//               <DropdownMenuItem
//                 key={status}
//                 aria-label={status}
//                 onClick={() => {}}
//               >
//                 <PenSquare
//                   className="mr-2 h-3.5 w-3.5 text-yellow-500"
//                   aria-hidden="true"
//                 />
//                 {status}
//               </DropdownMenuItem>
//             );
//           else if (status === "proposed")
//             return (
//               <DropdownMenuItem
//                 key={status}
//                 aria-label={status}
//                 onClick={() => {}}
//               >
//                 <HelpingHand
//                   className="mr-2 h-3.5 w-3.5 text-blue-500"
//                   aria-hidden="true"
//                 />
//                 {status}
//               </DropdownMenuItem>
//             );
//           else if (status === "published")
//             return (
//               <DropdownMenuItem
//                 key={status}
//                 aria-label={status}
//                 onClick={() => {}}
//               >
//                 <BadgeCheck
//                   className="mr-2 h-3.5 w-3.5 text-green-500"
//                   aria-hidden="true"
//                 />
//                 {status}
//               </DropdownMenuItem>
//             );
//           else
//             return (
//               <DropdownMenuItem
//                 key={status}
//                 aria-label={status}
//                 onClick={() => {}}
//               >
//                 <XCircle
//                   className="mr-2 h-3.5 w-3.5 text-rose-500"
//                   aria-hidden="true"
//                 />
//                 {status}
//               </DropdownMenuItem>
//             );
//         })}
//         <DropdownMenuItem
//           aria-label="Hide column"
//           onClick={() => column.toggleVisibility(false)}
//         >
//           <EyeNoneIcon
//             className="text-muted-foreground/70 mr-2 h-3.5 w-3.5"
//             aria-hidden="true"
//           />
//           Hide
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }
