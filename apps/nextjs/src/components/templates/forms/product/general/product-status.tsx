// import { Radio, RadioGroup } from "@nextui-org/radio";

import { useEffect, useState } from "react";

import type { Product, ProductUpdates } from "@pachi/db";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Label } from "~/components/ui/label";
import { RadioGroup } from "~/components/ui/radio-group";

interface ProductStatusProps {
  updateProduct: ({ updates }: { updates: ProductUpdates }) => Promise<void>;
  status: Product["status"];
}
export default function ProductStatus({
  updateProduct,
  status,
}: ProductStatusProps) {
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [value, setValue] = useState<"published" | "draft">("published");
  useEffect(() => {
    setValue(status as "published" | "draft");
  }, [status]);
  return (
    <div className="mt-2 flex w-full justify-between">
      <h2 className="prone text-md font-semibold">Status</h2>
      <AlertDialog open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm your action</AlertDialogTitle>
            <AlertDialogDescription>
              This action will make your product public
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-brand"
              onClick={async () => {
                setValue("published");
                await updateProduct({ updates: { status: "published" } });
                setOpen(false);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={open1}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm your action</AlertDialogTitle>
            <AlertDialogDescription>
              The product will not be viewed by public.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpen1(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setValue("draft");
                await updateProduct({ updates: { status: "draft" } });
                setOpen1(false);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RadioGroup
        className="flex"
        value={value as string}
        onValueChange={(e) => {
          console.log("e", e);
          if (e === "published") {
            setOpen(true);
          } else {
            setOpen1(true);
          }
        }}
      >
        <div className="flex items-center gap-x-3 ">
          <RadioGroup.Item
            value="published"
            id="published"
            className="text-green-500"
          />
          <Label htmlFor="published">Published</Label>
        </div>
        <div className="flex items-center gap-x-3">
          <RadioGroup.Item value="draft" id="draft" />
          <Label htmlFor="draft">Draft</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
