import type { Client } from "@pachi/validators";

import { Store } from "../store";

export const UserStore = new Store<Client.Store>().build();
export const ProductStore = new Store<Client.Product>().build();
