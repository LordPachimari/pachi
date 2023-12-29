import { CartService } from "./cart";
import { CartItemService } from "./cart-item";

export type Services = {
  lineItemService: typeof CartItemService;
  cartService: typeof CartService;
};
