import type { Transaction } from "@pachi/db";

import type { ReplicacheTransaction } from "../../replicache/transaction";
import type { CartService } from "../cart/service";

export class ServiceBase {
  protected readonly manager: Transaction;
  protected readonly replicacheTransaction: ReplicacheTransaction;
  constructor({
    manager,
    replicacheTransaction,
  }: {
    manager: Transaction;
    replicacheTransaction: ReplicacheTransaction;
  }) {
    this.manager = manager;
    this.replicacheTransaction = replicacheTransaction;
  }
}

export type Services = {
  cartService: CartService;
};
