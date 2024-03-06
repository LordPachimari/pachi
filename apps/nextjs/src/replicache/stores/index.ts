import type { Product, Store as StoreType } from '@pachi/db'

import { Store } from '../store'

export const UserStore = new Store<StoreType>().build()
export const ProductStore = new Store<Product>().build()
