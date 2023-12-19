import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MinusIcon, PlusIcon } from "lucide-react";

import type { CartItem } from "@pachi/db";
import { cn } from "@pachi/utils";

import { ReplicacheInstancesStore } from "~/zustand/replicache";

export default function EditItemQuantityButton({
  item,
  type,
}: {
  item: CartItem;
  type: "plus" | "minus";
}) {
  const [isPending, startTransition] = useTransition();
  const globalRep = ReplicacheInstancesStore((state) => state.globalRep);
  const updateItemQuantity = useCallback(
    async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const cartId = localStorage.getItem("cartId");
      if (!cartId) return;
      await globalRep?.mutate.updateItemQuantity({
        args: {
          cartId,
          itemId,
          quantity,
        },
      });
    },
    [],
  );

  return (
    <button
      aria-label={
        type === "plus" ? "Increase item quantity" : "Reduce item quantity"
      }
      onClick={() => {
        startTransition(async () => {
          await updateItemQuantity({
            itemId: item.id,
            quantity: type === "plus" ? item.quantity + 1 : item.quantity - 1,
          });
        });
      }}
      disabled={isPending}
      className={cn(
        "ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full px-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80",
        {
          "cursor-not-allowed": isPending,
          "ml-auto": type === "minus",
        },
      )}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : type === "plus" ? (
        <PlusIcon className="h-4 w-4 dark:text-neutral-500" />
      ) : (
        <MinusIcon className="h-4 w-4 dark:text-neutral-500" />
      )}
    </button>
  );
}
