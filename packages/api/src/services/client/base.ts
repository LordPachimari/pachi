import type { WriteTransaction } from "replicache";

export interface ServiceBase {
  manager: WriteTransaction;
}
