export const buildProductPayload = (state: any) => {
  const {
    product,
    variants = [],
    specifications = [],
    fitments = [],
    medias = [],
    oemNumbers = [],
  } = state;

  if (!product?.name || !product?.brandId || !product?.categoryId) {
    throw new Error("Missing required product fields");
  }

  const safeVariants =
    variants.length > 0
      ? variants
      : [
          {
            name: `${product.name} Default`,
            sku: `${product.name
              .replace(/\s+/g, "-")
              .toUpperCase()}-001`,
            price: 0,
            costPrice: 0,
            compareAtPrice: undefined,
            weight: undefined,
            length: undefined,
            width: undefined,
            height: undefined,
            barcode: undefined,
            isActive: true,
            attributes: [],
            inventories: [],
          },
        ];

  return {
    name: product.name,
    description: product.description || undefined,

    brandId: product.brandId,
    categoryId: product.categoryId,

    isActive: product.isActive ?? true,
    isFeatured: product.isFeatured ?? false,

    searchKeywords: product.searchKeywords || undefined,

    //////////////////////////////////////////////////////////
    // OEM NUMBERS
    //////////////////////////////////////////////////////////
    oemNumbers: oemNumbers?.length
      ? oemNumbers.map((o: any) => ({
          oemNumber: o.oemNumber || o.value || "",
        }))
      : undefined,

    //////////////////////////////////////////////////////////
    // VARIANTS
    //////////////////////////////////////////////////////////
    variants: safeVariants.map((v: any) => ({
      name: v.name,
      sku: v.sku,

      price: Number(v.price || 0),
      costPrice:
        v.costPrice !== undefined && v.costPrice !== null
          ? Number(v.costPrice)
          : undefined,

      compareAtPrice:
        v.compareAtPrice !== undefined && v.compareAtPrice !== null
          ? Number(v.compareAtPrice)
          : undefined,

      weight:
        v.weight !== undefined && v.weight !== null
          ? Number(v.weight)
          : undefined,

      length:
        v.length !== undefined && v.length !== null
          ? Number(v.length)
          : undefined,

      width:
        v.width !== undefined && v.width !== null
          ? Number(v.width)
          : undefined,

      height:
        v.height !== undefined && v.height !== null
          ? Number(v.height)
          : undefined,

      barcode: v.barcode || undefined,
      isActive: v.isActive ?? true,

      ////////////////////////////////////////////////////////
      // ATTRIBUTES
      ////////////////////////////////////////////////////////
      attributes: v.attributes?.length
        ? v.attributes.map((a: any) => ({
            valueId: a.valueId,
          }))
        : undefined,

      ////////////////////////////////////////////////////////
      // INVENTORIES
      ////////////////////////////////////////////////////////
      inventories: v.inventories?.length
        ? v.inventories.map((inv: any) => ({
            warehouseId: inv.warehouseId,
            stock: Number(inv.stock || 0),
            reserved: Number(inv.reserved ?? 0),
            threshold: Number(inv.threshold ?? 0),
          }))
        : undefined,
    })),

    //////////////////////////////////////////////////////////
    // SPECIFICATIONS
    //////////////////////////////////////////////////////////
    specifications: specifications?.length
      ? specifications.map((s: any) => ({
          name: s.name,
          value: s.value,
        }))
      : undefined,

    //////////////////////////////////////////////////////////
    // PRODUCT FITMENTS
    //////////////////////////////////////////////////////////
    productFitments: fitments?.length
      ? fitments.map((f: any) => ({
          trimId: f.trimId,
          notes: f.notes || undefined,
        }))
      : undefined,

    //////////////////////////////////////////////////////////
    // MEDIA
    //////////////////////////////////////////////////////////
    medias: medias?.length
      ? medias.map((m: any, i: number) => ({
          url: m.url,
          type: String(m.type).toUpperCase() as "IMAGE" | "VIDEO",
          position: m.position ?? i,
        }))
      : undefined,
  };
};