import { enumType, type Output } from "valibot";

export const prefixEnum = enumType([
  "user",
  "p",
  "dashboard",
  "default_sp",
  "giftcard_sp",
  "default_sc",
  "st",
  "f_flag",
  "col",
  "cat",
  "var",
  "opt",
  "opt_val",
  "draft",
  "l_item",
  "l_adj",
  "l_item_txl",
  "sm_txl",
  "cart",
  "m_amount",
  "image",
  "country",
  "unauthenticated",
  "store",
] as const);
export type Prefix = Output<typeof prefixEnum>;

export const generateId = ({
  id,
  prefix,
  filter_id,
}: {
  id: string;
  prefix: Prefix;
  filter_id?: string;
}) => {
  return filter_id ? `${prefix}_${filter_id}_${id}` : `${prefix}_${id}`;
};
