// TYPE DEFINITIONS FOR CLIENT (MOBILE, WEB)
// ALL CLIENT TYPES INCLUDE JOINS, AS WE USE INDEXEDDB TO STORE DATA ON THE CLIENT
// INDEXEDDB IS A NOSQL DATABASE, SO WE STORE FULLY RETRIEVED JSON OBJECTS

import type { Image, Server } from "../..";

export type ProductVariant = Omit<Server.ProductVariant, "images"> & {
  product?: Product;
  prices?: Server.Price[];
  images?: Image[] | undefined;
  optionValues?: Array<{ value: ProductOptionValue }>;
};
export type Product = Omit<Server.Product, "thumbnail"> & {
  variants?: ProductVariant[];
  options?: ProductOption[];
  thumbnail?: Image;
  collection: Server.ProductCollection;
};
export type ProductOption = Server.ProductOption & {
  values?: ProductOptionValue[];
};
export type Store = Server.Store & {
  products?: Product[];
  founder?: Server.User;
};
export type Price = Server.Price;
export type ProductOptionValue = Server.ProductOptionValue & {
  option?: ProductOption;
};
export type User = Server.User;
export type Address = Server.Address;
export type PublishedProduct = Required<Product> & { title: string };
