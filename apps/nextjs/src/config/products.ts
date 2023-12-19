export const sortOptions = [
  { label: "Date: Old to new", value: "createdAt.asc" },
  {
    label: "Date: New to old",
    value: "createdAt.desc",
  },
  { label: "Price: Low to high", value: "price.asc" },
  { label: "Price: High to low", value: "price.desc" },
  {
    label: "Alphabetical: A to Z",
    value: "name.asc",
  },
  {
    label: "Alphabetical: Z to A",
    value: "name.desc",
  },
];

export const productCategories = [
  {
    title: "Electronics",
    image: "/images/electronics.webp",
  },
  {
    title: "Clothing",
    image: "/images/clothing-one.webp",
  },
  {
    title: "Shoes",

    image: "/images/backpack-one.webp",
  },
  {
    title: "Accessories",
    image: "/images/backpack-one.webp",
  },
  {
    title: "Other",
    image: "/images/backpack-one.webp",
  },
];
// satisfies {
//   title: PublishedProduct["category"];
//   image: string;
// }[];

export const productTags = [
  "new",
  "sale",
  "bestseller",
  "featured",
  "popular",
  "trending",
  "limited",
  "exclusive",
];
