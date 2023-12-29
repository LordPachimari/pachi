import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Loader2, XIcon } from "lucide-react";

import type { CartItem } from "@pachi/db";

import { ReplicacheInstancesStore } from "~/zustand/replicache";

export default function DeleteItemButton({ item }: { item: CartItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const globalRep = ReplicacheInstancesStore((state) => state.globalRep);
  const deleteItem = useCallback(async (id: string) => {
    const cartId = localStorage.getItem("cartId");
    if (!cartId) return;
    await globalRep?.mutate.deleteItem({
      args: {
        cartId,
        id,
      },
    });
  }, []);

  return (
    <button
      aria-label="Remove cart item"
      onClick={() => {
        startTransition(async () => {
          const error = await deleteItem(item.id);
        });
      }}
      disabled={isPending}
      className={clsx(
        "ease flex h-[17px] w-[17px] items-center justify-center rounded-full bg-neutral-500 transition-all duration-200",
        {
          "cursor-not-allowed px-0": isPending,
        },
      )}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <XIcon className="hover:text-accent-3 mx-[1px] h-4 w-4 text-white dark:text-black" />
      )}
    </button>
  );
}
