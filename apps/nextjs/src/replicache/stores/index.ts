import type { Product } from "@pachi/db";
import { Store } from "../store";
import type {Store as StoreType} from "@pachi/db"

export const UserStore = new Store<StoreType>().build();
export const ProductStore = new Store<Product>().build();
