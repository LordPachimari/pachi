import { Context } from "effect";

import type { Db, Transaction } from "@pachi/db";
import type { RequestHeaders } from "@pachi/types";

import type { ReplicacheTransaction } from "../replicache";
import type { RepositoriesType, ServicesType } from "../server";

export interface ServerContext {
  manager: Transaction | Db;
  userId: string | undefined;
  requestHeaders: RequestHeaders | undefined;
  services: ServicesType;
  repositories: RepositoriesType;
  replicacheTransaction: ReplicacheTransaction;
}
export const ServerContext = Context.Tag<ServerContext>();
