import type { Category } from "../../services/categoryApi";
import {
  Cpu,
  Disc,
  Zap,
  Filter,
  Wrench,
  Cog,
  Car,
  Droplets,
} from "lucide-react";

export interface NavbarCategory {
  title: string;
  icon: React.ReactNode;
  items: string[];
}

/* =========================================================
ICON MAP
========================================================= */

const iconRegistry: Record<string, any> = {
  engine: Cpu,
  brake: Disc,
  suspension: Wrench,
  electrical: Zap,
  filter: Filter,
  transmission: Cog,
  drivetrain: Cog,
  body: Car,
  lubricant: Droplets,
  general: Car,
};

/* =========================================================
ICON RESOLVER
========================================================= */

const resolveIconByType = (type?: string) => {
  const key = (type || "general").toLowerCase();

  return iconRegistry[key] || Car;
};

/* =========================================================
MAIN TRANSFORM
========================================================= */

export const transformCategoriesToNavbar = (
  categories: Category[] = []
): NavbarCategory[] => {
  if (!categories.length) return [];

  /**
   * Group categories by TYPE
   * Example:
   * engine -> [Oil Pump, Timing Belt]
   * brake -> [Brake Pad, Rotor]
   */

  const grouped: Record<string, Category[]> = {};

  for (const category of categories) {
    // skip inactive categories if needed
    if (!category.isActive) continue;

    const type = (category.type || "general").toLowerCase();

    if (!grouped[type]) {
      grouped[type] = [];
    }

    grouped[type].push(category);
  }

  return Object.entries(grouped).map(([type, cats]) => {
    const Icon = resolveIconByType(type);

    /**
     * Remove duplicate names
     * + sort alphabetically for clean navbar UI
     */

    const uniqueItems = Array.from(
      new Set(
        cats
          .map((category) => category.name?.trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

    return {
      title:
        type.charAt(0).toUpperCase() +
        type.slice(1).toLowerCase(),

      icon: <Icon size={16} />,

      items: uniqueItems,
    };
  });
};