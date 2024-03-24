import type { Client } from "@pachi/validators";

import { Store } from "../store";

export const ProductStore = new Store<Client.Product>().build();
