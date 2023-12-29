"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, PlusIcon } from "lucide-react";
import { ulid } from "ulid";

import type { ProductVariant } from "@pachi/db";
import { cn, generateId } from "@pachi/utils";

import { ReplicacheInstancesStore } from "~/zustand/replicache";

export function AddToCart({
  variants,
  availableForSale,
}: {
  variants: ProductVariant[];
  availableForSale: boolean;
}) {
  const globalRep = ReplicacheInstancesStore((state) => state.globalRep);
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const defaultVariant = variants[0]!;
  const variant = variants.find((variant: ProductVariant) =>
    (variant.optionValues ?? []).every(
      (optionValue) =>
        optionValue.optionValue.value ===
        searchParams.get(
          (optionValue.optionValue.option?.name ?? "").toLowerCase(),
        ),
    ),
  );
  const selectedVariantId = variant?.id ?? defaultVariant.id;
  const title = !availableForSale
    ? "Out of stock"
    : !selectedVariantId
    ? "Please select options"
    : undefined;
  const addItemToCart = useCallback(async () => {
    const cartId = localStorage.getItem("cartId");
    const newCartId = generateId({ id: ulid(), prefix: "cart" });
    if (!cartId) {
      await globalRep?.mutate.createCart({
        args: {
          cart: {
            id: newCartId,
            regionId: "1",
            currencyCode: "USD",
          },
        },
      });
    }
    await globalRep?.mutate.addItemToCart({
      args: {
        cartId: cartId ?? newCartId,
        currencyCode: "USD",
        variantId: selectedVariantId,
        quantity: 1,
        cartItemId: generateId({ id: ulid(), prefix: "l_item" }),
        productId: defaultVariant.productId,
      },
    });
  }, []);

  return (
    <button
      aria-label="Add item to cart"
      disabled={isPending || !availableForSale || !selectedVariantId}
      title={title}
      onClick={() => {
        // Safeguard in case someone messes with `disabled` in devtools.
        if (!availableForSale || !selectedVariantId) return;

        startTransition(async () => {
          await addItemToCart();
        });
      }}
      className={cn(
        "relative flex w-full items-center justify-center rounded-full bg-brand p-4 tracking-wide text-white hover:opacity-90",
        {
          "cursor-not-allowed opacity-60 hover:opacity-60":
            !availableForSale || !selectedVariantId,
          "cursor-not-allowed": isPending,
        },
      )}
    >
      <div className="absolute left-0 ml-4">
        {!isPending ? (
          <PlusIcon className="h-5" />
        ) : (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
      </div>
      <span>{availableForSale ? "Add To Cart" : "Out Of Stock"}</span>
    </button>
  );
}
