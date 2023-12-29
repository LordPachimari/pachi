import type { RequestHeaders } from "@pachi/types";

import type { Repositories } from "../../repositories";
import type { CartService_ } from "../../services/server/cart";
import type { CartItemService_ } from "../../services/server/cart-item";
import type { Bindings } from "../bindings";

// import {
//   CartService_,
//   CartItemService_,
//   PriceSelectionService_,
//   PricingService_,
//   TaxProviderService_,
//   TaxRateService_,
//   TransactionBaseService_,
// } from "../../services/server";

export interface MutationBase {
  userId?: string | undefined;
  requestHeaders?: RequestHeaders;
  // services: {
  // taxService: TaxRateService_;
  // priceService: PriceSelectionService_;
  // pricingService: PricingService_;
  // taxProviderService: TaxProviderService_;
  // transactionService: TransactionBaseService_;
  // cartService: CartService_;
  // lineItemService: CartItemService_;
  // };
  services?: {
    cartItemService: CartItemService_;
    cartService: CartService_;
  };
  repositories?: Repositories;
  env?: Bindings;
}
