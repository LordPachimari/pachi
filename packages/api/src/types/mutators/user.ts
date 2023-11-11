import { array, number, object, string, type Output } from "valibot";

import type { MutationBase } from "./base";

const ItemsSchema = array(
  object({
    id: string(),
    variant_id: string(),
    quantity: number(),
  }),
);
type Items = Output<typeof ItemsSchema>;
export interface AddToCartProps extends MutationBase {
  args: {
    items: Items;
    cart_id: string;
    region_id: string;
  };
}
export interface DeleteItemProps extends MutationBase {
  args: {
    item_id: string;
  };
}
export interface UpdateItemQuantityProps extends MutationBase {
  args: {
    item_id: string;
    quantity: number;
  };
}
