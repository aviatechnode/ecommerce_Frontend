import type { Category } from "../../admin/state-management/categorySlice";
import {
  Cpu,
  Disc,
  Zap,
  Filter,
  Wrench,
  Cog,
  Car,
} from "lucide-react";

export interface NavbarCategory {
  title: string;
  icon: React.ReactNode;
  items: string[];
}

/* ================= ICON MAP ================= */
const iconRegistry: Record<string, any> = {
  engine: Cpu,
  brake: Disc,
  suspension: Wrench,
  electrical: Zap,
  filter: Filter,
  transmission: Cog,
  drivetrain: Cog,
  body: Car,
  general: Car,
};

/* ================= ICON RESOLVER ================= */
const resolveIconByType = (type?: string) => {
  const key = (type || "general").toLowerCase();
  return iconRegistry[key] || Car;
};

/* ================= MAIN TRANSFORM ================= */
export const transformCategoriesToNavbar = (
  categories: Category[] = []
): NavbarCategory[] => {
  if (!categories.length) return [];

  // group by TYPE (NOT parentId)
  const grouped: Record<string, Category[]> = {};

  for (const cat of categories) {
    const type = (cat.type || "general").toLowerCase();

    if (!grouped[type]) grouped[type] = [];

    grouped[type].push(cat);
  }

  return Object.entries(grouped).map(([type, cats]) => {
    const Icon = resolveIconByType(type);

    return {
      title: type.toUpperCase(),
      icon: <Icon size={16} />,
      items: cats.map((c) => c.name),
    };
  });
};