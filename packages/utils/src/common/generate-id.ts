import { enumType, type Output } from "valibot";

export const prefixEnum = enumType([
  "user",
  "p",
  "p_tag",
  "dashboard",
  "default_sp",
  "giftcard_sp",
  "default_sc",
  "st",
  "f_flag",
  "col",
  "cat",
  "var",
  "default_var",
  "opt",
  "opt_val",
  "draft",
  "l_item",
  "l_adj",
  "l_item_txl",
  "sm_txl",
  "cart",
  "price",
  "image",
  "country",
  "unauth",
  "store",
] as const);
export type Prefix = Output<typeof prefixEnum>;

export const generateId = ({
  id,
  prefix,
  filterId,
}: {
  id: string;
  prefix: Prefix;
  filterId?: string;
}) => {
  return filterId ? `${prefix}_${filterId}_${id}` : `${prefix}_${id}`;
};
