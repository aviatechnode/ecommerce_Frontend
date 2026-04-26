export const buildProductPayload = (state: any) => {
  const fd = new FormData();

  const { product, variants, specifications, fitments, images } = state;

  /* PRODUCT */
  Object.entries(product).forEach(([k, v]) => {
    if (v) fd.append(k, String(v));
  });

  /* VARIANTS */
  fd.append("variants", JSON.stringify(variants));

  /* SPECS */
  fd.append("specifications", JSON.stringify(specifications));

  /* FITMENTS */
  fd.append("fitments", JSON.stringify(fitments));

  /* IMAGES */
  images.forEach((img: File) => fd.append("images", img));

  return fd;
};