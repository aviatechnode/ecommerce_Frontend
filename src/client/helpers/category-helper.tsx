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
ORDER + CONFIG
========================================================= */

const categoryConfig = {
  engine: {
    title: "Engine & Performance",
    icon: Cpu,
    order: 1,
  },

  brake: {
    title: "Brake System",
    icon: Disc,
    order: 2,
  },

  suspension: {
    title: "Suspension & Steering",
    icon: Wrench,
    order: 3,
  },

  electrical: {
    title: "Electrical",
    icon: Zap,
    order: 4,
  },

  filter: {
    title: "Filters",
    icon: Filter,
    order: 5,
  },

  transmission: {
    title: "Transmission",
    icon: Cog,
    order: 6,
  },

  drivetrain: {
    title: "Drivetrain",
    icon: Cog,
    order: 7,
  },

  body: {
    title: "Body & Exterior",
    icon: Car,
    order: 8,
  },

  lubricant: {
    title: "Lubricants",
    icon: Droplets,
    order: 9,
  },

  general: {
    title: "General Parts",
    icon: Car,
    order: 99,
  },
};

/* =========================================================
MAIN TRANSFORM
========================================================= */

export const transformCategoriesToNavbar = (
  categories: Category[] = []
): NavbarCategory[] => {
  if (!categories.length) return [];

  const grouped: Record<string, Category[]> = {};

  for (const category of categories) {
    if (!category.isActive) continue;

    const type = (category.type || "general").toLowerCase();

    if (!grouped[type]) {
      grouped[type] = [];
    }

    grouped[type].push(category);
  }

  return Object.entries(grouped)
    .sort(([a], [b]) => {
      const orderA =
        categoryConfig[a as keyof typeof categoryConfig]?.order || 999;

      const orderB =
        categoryConfig[b as keyof typeof categoryConfig]?.order || 999;

      return orderA - orderB;
    })
    .map(([type, cats]) => {
      const config =
        categoryConfig[type as keyof typeof categoryConfig] ||
        categoryConfig.general;

      const Icon = config.icon;

      const uniqueItems = Array.from(
        new Set(
          cats
            .map((category) => category.name?.trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b));

      return {
        title: config.title,
        icon: <Icon size={16} className="text-emerald-100" />,
        items: uniqueItems,
      };
    });
};