import type { Db, Transaction } from "@pachi/db";

import type { ReplicacheTransaction } from "../../replicache";

export class ServiceBase_ {
  protected readonly manager: Transaction;
  protected readonly replicacheTransaction: ReplicacheTransaction;
  protected readonly storage: KVNamespace;
  constructor({
    manager,
    replicacheTransaction,
    storage,
  }: {
    manager: Transaction;
    replicacheTransaction: ReplicacheTransaction;
    storage: KVNamespace;
  }) {
    this.manager = manager;
    this.replicacheTransaction = replicacheTransaction;
    this.storage = storage;
  }
}
