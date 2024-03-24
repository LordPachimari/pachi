import type { Client } from "@pachi/validators";

import { Store } from "../store";

export const UserStore = new Store<Client.Store>().build();
