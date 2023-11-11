import { slugify } from "@pachi/utils";

import { productCategories } from "~/config/products";
import type { MainNavItem } from "~/types";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Resell",
  description: "An e-commerce for reselling items.",
  url: "https://skateshop.sadmn.com",
  ogImage: "https://skateshop.sadmn.com/opengraph-image.png",
  mainNav: [
    {
      title: "Lobby",
      items: [
        {
          title: "Products",
          href: "/products",
          description: "All the products we have to offer.",
          items: [],
        },
      ],
    },
    ...productCategories.map((category) => ({
      title: category.title,
      items: [
        {
          title: "All",
          href: `/categories/${slugify(category.title)}`,
          description: `All ${category.title}.`,
          items: [],
        },
      ],
    })),
  ] satisfies MainNavItem[],
  links: {
    twitter: "https://twitter.com/sadmann17",
    github: "https://github.com/sadmann7/skateshop",
  },
};
