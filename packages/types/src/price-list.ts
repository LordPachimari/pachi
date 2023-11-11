export enum PriceListType {
  SALE = "sale",
  OVERRIDE = "override",
}
export type PriceListPriceUpdateInput = {
  id?: string;
  variant_id?: string;
  region_id?: string;
  currency_code?: string;
  amount?: number;
  min_quantity?: number;
  max_quantity?: number;
};

export type PriceListPriceCreateInput = {
  region_id?: string;
  currency_code?: string;
  amount: number;
  min_quantity?: number;
  max_quantity?: number;
};

export type PriceListLoadConfig = {
  include_discount_prices?: boolean;
  customer_id?: string;
  cart_id?: string;
  region_id?: string;
  currency_code?: string;
};
