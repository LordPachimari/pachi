import type { RequestHeaders } from "@pachi/types";

import type { Repositories } from "../../repositories";
import type { Bindings } from "../bindings";

// import {
//   CartService_,
//   LineItemService_,
//   PriceSelectionService_,
//   PricingService_,
//   TaxProviderService_,
//   TaxRateService_,
//   TransactionBaseService_,
// } from "../../services/server";

export interface MutationBase {
  user?: { id: string; email: string };
  requestHeaders?: RequestHeaders;
  // services: {
  // taxService: TaxRateService_;
  // priceService: PriceSelectionService_;
  // pricingService: PricingService_;
  // taxProviderService: TaxProviderService_;
  // transactionService: TransactionBaseService_;
  // cartService: CartService_;
  // lineItemService: LineItemService_;
  // };
  repositories?: Repositories;
  env?: Bindings;
}
