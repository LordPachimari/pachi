import type { WriteTransaction } from "replicache";

import type { CartService } from "../cart";

export class ServiceBase {
  protected manager: WriteTransaction;
  constructor({ manager }: { manager: WriteTransaction }) {
    this.manager = manager;
  }
}

export type Services = {
  cartService: CartService;
};
