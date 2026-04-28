type SKUInput = {
  brand?: string;
  category?: string;
  product?: string;
  variant?: string;
  index: number;
  allowFallback?: boolean;
};

const normalize = (value?: string, len = 3) =>
  value
    ? value
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, len)
    : "";

export const generateSKU = ({
  brand,
  category,
  product,
  variant,
  index,
  allowFallback = false,
}: SKUInput): string => {
  const b = normalize(brand);
  const c = normalize(category);
  const p = normalize(product, 4);
  const v = normalize(variant, 3);

  if (!allowFallback && (!b || !c)) {
    throw new Error("Brand and Category are required to generate SKU");
  }

  const brandCode = b || "XXX";
  const categoryCode = c || "XXX";
  const productCode = p || "ITEM";
  const variantCode = v || "VAR";

  const indexPart = String(index + 1).padStart(3, "0");
  const random = Math.floor(1000 + Math.random() * 9000);

  return `${brandCode}-${categoryCode}-${productCode}-${variantCode}-${indexPart}-${random}`;
};