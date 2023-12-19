import { useSubscribe } from "replicache-react";
import { ulid } from "ulid";

import type { Cart as CartType } from "@pachi/db";
import { generateId } from "@pachi/utils";

import { ReplicacheInstancesStore } from "~/zustand/replicache";
import CartModal from "./modal";

export default function Cart() {
  const globalRep = ReplicacheInstancesStore((state) => state.globalRep);
  const cartId = localStorage.getItem("cartId");
  const cart = useSubscribe(
    globalRep,
    async (tx) => {
      const cart = cartId
        ? ((await tx.get(cartId)) as CartType | undefined)
        : undefined;
      if (!cart) {
        const newCart: CartType = {
          id: generateId({ id: ulid(), prefix: "cart" }),
          regionId: "1",
          currencyCode: "USD",
          totalQuantity: 0,
        };
        await globalRep?.mutate.createCart({
          args: {
            cart: newCart,
          },
        });
        localStorage.setItem("cartId", newCart.id);
      }
      return cart;
    },
    undefined,
    [cartId],
  );
  return <CartModal cart={cart} />;
}
