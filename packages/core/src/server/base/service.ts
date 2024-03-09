import { CartService, type CartServiceType } from "../cart/service"

export type ServicesType = {
  CartService: CartServiceType
}
export const Services: ServicesType = {
  CartService,
}
