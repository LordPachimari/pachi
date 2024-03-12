import type { SidebarNavItem } from "~/types";

export interface DashboardConfig {
  sidebarNav: SidebarNavItem[];
}
export const dashboardConfig: DashboardConfig = {
  sidebarNav: [
    // {
    //   title: "Account",
    //   href: "/dashboard/account",
    //   icon: "user",
    //   items: [],
    // },
    {
      title: "Products",
      href: "/dashboard/products",
      icon: "product",
      items: [],
    },
    {
      title: "My Orders",
      href: "/dashboard/my-orders",
      icon: "billing",
      items: [],
    },
    {
      title: "Customer Orders",
      href: "/dashboard/customer-orders",
      icon: "dollarSign",
      items: [],
    },
    {
      title: "Customers",
      href: "/dashboard/customers",
      icon: "people",
      items: [],
    },
    {
      title: "Discounts",
      href: "/dashboard/discounts",
      icon: "discount",
      items: [],
    },
  ],
};
