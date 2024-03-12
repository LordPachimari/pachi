import { Context } from "effect";
import type { WriteTransaction } from "replicache";

import type { RepositoriesType } from "../server";

export class ClientContext extends Context.Tag("ClientContext")<
  ClientContext,
  {
    repositories: RepositoriesType;
    manager: WriteTransaction;
  }
>() {}
