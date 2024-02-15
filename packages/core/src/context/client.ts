import { Context } from "effect";
import type { WriteTransaction } from "replicache";

import type { RepositoriesType } from "../server";

export interface ClientContext {
  repositories: RepositoriesType;
  manager: WriteTransaction;
}
export const ClientContext = Context.Tag<ClientContext>();
