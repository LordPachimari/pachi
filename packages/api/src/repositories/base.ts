import type { Db, Transaction } from "@pachi/db";

export class RepositoryBase {
  protected readonly manager: Transaction | Db;
  constructor(manager: Transaction | Db) {
    this.manager = manager;
  }
}
