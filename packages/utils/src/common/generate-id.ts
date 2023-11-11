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
  "p_col",
  "p_cat",
  "p_var",
  "p_opt",
  "p_opt_val",
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
  additional_id,
}: {
  id: string;
  prefix: Prefix;
  additional_id?: string;
}) => {
  return additional_id ? `${prefix}_${id}_${additional_id}` : `${prefix}_${id}`;
};
