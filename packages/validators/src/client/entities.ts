// TYPE DEFINITIONS FOR CLIENT (MOBILE, WEB)
// ALL CLIENT TYPES INCLUDE JOINS, AS WE USE INDEXEDDB TO STORE DATA ON THE CLIENT
// INDEXEDDB IS A NOSQL DATABASE, SO WE STORE FULLY RETRIEVED JSON OBJECTS

import type { Image, Server } from "../..";

export type ProductVariant = Omit<Server.ProductVariant, "images"> & {
  product?: Product;
  prices?: Server.Price[];
  images?: Image[] | undefined;
  optionValues?: Array<{ value: Server.ProductOptionValue }>;
};
export type Product = Omit<Server.Product, "thumbnail"> & {
  variants?: ProductVariant[];
  options?: ProductOption[];
  thumbnail?: Image;
};
export type ProductOption = Server.ProductOption & {
  values: Server.ProductOptionValue[];
};
export type Store = Server.Store & {
  products?: Product[];
  founder?: Server.User;
};
