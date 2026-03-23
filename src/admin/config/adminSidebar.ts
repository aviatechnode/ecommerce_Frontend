export type SidebarItem = {
  label: string;
  path: string;
  icon?: string;
  permission?: string;
};

export type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

export const adminSidebar: SidebarSection[] = [
  {
    title: "Dashboard",
    items: [
      {
        label: "Overview",
        path: "/admin",
        icon: "dashboard",
      },
    ],
  },

  {
    title: "Catalog",
    items: [
      {
        label: "Products",
        path: "/admin/products",
        permission: "product.read",
      },
      {
        label: "Categories",
        path: "/admin/categories",
        permission: "category.read",
      },
      {
        label: "Brands",
        path: "/admin/brands",
        permission: "brand.read",
      },
    ],
  },

  {
    title: "Orders",
    items: [
      {
        label: "Orders",
        path: "/admin/orders",
        permission: "order.read",
      },
    ],
  },

  {
    title: "Users & Roles",
    items: [
      {
        label: "Users",
        path: "/admin/users",
        permission: "user.read",
      },
      {
        label: "Roles",
        path: "/admin/roles",
        permission: "role.read",
      },
    ],
  },

  {
    title: "Inventory",
    items: [
      {
        label: "Warehouses",
        path: "/admin/warehouses",
        permission: "inventory.read",
      },
    ],
  },

  {
    title: "Marketing",
    items: [
      {
        label: "Coupons",
        path: "/admin/coupons",
        permission: "coupon.read",
      },
    ],
  },

  {
    title: "System",
    items: [
      {
        label: "Audit Logs",
        path: "/admin/audit-logs",
        permission: "audit.read",
      },
    ],
  },
];