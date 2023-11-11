import { Sheet } from "lucide-react";

import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/atoms/sheet";

interface CreateDiscountSheetProps {
  children: React.ReactNode;
}
export function CreateDiscountSheet({ children }: CreateDiscountSheetProps) {
  return (
    <Sheet>
      <SheetTrigger>Open</SheetTrigger>

      <SheetHeader>
        <SheetTitle>Create new discount?</SheetTitle>
      </SheetHeader>
      <SheetContent>{/* <DiscountType /> */}</SheetContent>
    </Sheet>
  );
}
