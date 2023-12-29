import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

// import type { Price, ProductVariant, Region } from "@pachi/db";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(price));
}

export function formatDate(date: Date) {
  return dayjs(date).format("MMMM D, YYYY");
}

export function formatBytes(
  bytes: number,
  decimals = 0,
  sizeType: "accurate" | "normal" = "normal",
) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === "accurate" ? accurateSizes[i] ?? "Bytest" : sizes[i] ?? "Bytes"
  }`;
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function unslugify(str: string) {
  return str.replace(/-/g, " ");
}

export function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase(),
  );
}

export function toSentenceCase(str: string) {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

export function isArrayOfFile(files: unknown): files is File[] {
  const isArray = Array.isArray(files);
  if (!isArray) return false;
  return files.every((file) => file instanceof File);
}

// export type RegionInfo = Pick< Region,
//   "currencyCode" | "tax_code" | "tax_rate"
// >;
// type ComputeAmountParams = {
//   amount: number;
//   region: RegionInfo;
//   includeTaxes?: boolean;
// };

export type Money = {
  amount: number;
  currencyCode: string;
};
/**
 * Takes an amount, a region, and returns the amount as a decimal including or excluding taxes
 */
// export const computeAmount = ({
//   amount,
//   region,
//   includeTaxes = true,
// }: ComputeAmountParams) => {
//   const toDecimal = convertToDecimal(amount, region.currencyCode);

//   const taxRate = includeTaxes ? getTaxRate(region) : 0;

//   const amountWithTaxes = toDecimal * (1 + taxRate);

//   return amountWithTaxes;
// };

// we should probably add a more extensive list
const noDivisionCurrencies = ["krw", "jpy", "vnd"];

export const convertToDecimal = (amount: number, currencyCode = "USD") => {
  const divisor = noDivisionCurrencies.includes(currencyCode.toLowerCase())
    ? 1
    : 100;

  return Math.floor(amount) / divisor;
};

// const getTaxRate = (region?: RegionInfo) => {
//   return region && !isEmpty(region) ? region?.tax_rate / 100 : 0;
// };

// export const calculateVariantAmount = (variant: ProductVariant): Money => {
//   const currencyCode = variant.prices?.[0]?.currencyCode ?? "USD";
//   const amount = convertToDecimal(
//     variant.prices?.[0]?.amount || 0,
//     currencyCode,
//   );
//   return {
//     amount,
//     currencyCode,
//   };
// };
