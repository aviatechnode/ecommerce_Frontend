import { useEffect, useMemo, useRef } from "react";

import {
  useForm,
  useFieldArray,
  useWatch,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  createProductSchema,
  type CreateProductInput,
} from "../../../schemas/product.schema";

import { useCreateProductMutation } from "../../../services/productApi";
import { useProductBuilder } from "../../store/productBuilderStore";

/* =========================================================
   TYPES
========================================================= */

type FormValues = z.input<typeof createProductSchema>;
type ParsedValues = z.output<typeof createProductSchema>;

/* =========================================================
   HELPERS
========================================================= */

const safeNumber = (
  value: unknown,
  fallback?: number
): number | undefined => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  const n =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(n) ? n : fallback;
};

/* =========================================================
   HOOK
========================================================= */

export function useProductForm() {
  const [createProduct] = useCreateProductMutation();

  const store = useProductBuilder();

  /* =========================================================
     DEFAULT VALUES
  ========================================================= */

  const defaultValues: FormValues = useMemo(
    () => ({
      name: store.product.name ?? "",
      description: store.product.description ?? "",

      brandId: store.product.brandId ?? "",
      categoryId: store.product.categoryId ?? "",

      isActive: store.product.isActive ?? true,
      isFeatured: store.product.isFeatured ?? false,

      searchKeywords:
        store.product.searchKeywords ?? "",

      oemNumbers: store.oemNumbers.map((i) => ({
        oemNumber: i.oemNumber ?? "",
      })),

      specifications: store.specifications.map(
        (s) => ({
          name: s.name ?? "",
          value: s.value ?? "",
        })
      ),

      productFitments: store.fitments.map(
        (f) => ({
          trimId: f.trimId ?? "",
          notes: f.notes ?? "",
        })
      ),

      medias: store.medias.map((m) => ({
        id: m.id,
        url: m.url ?? "",
        type: m.type ?? "IMAGE",
        position: safeNumber(m.position, 0) ?? 0,
      })),

      variants: store.variants.map((v) => ({
        id: v.id,

        name: v.name ?? "",
        sku: v.sku ?? "",

        price: safeNumber(v.price, 0) ?? 0,

        costPrice: safeNumber(v.costPrice),
        compareAtPrice: safeNumber(
          v.compareAtPrice
        ),

        weight: safeNumber(v.weight),
        length: safeNumber(v.length),
        width: safeNumber(v.width),
        height: safeNumber(v.height),

        barcode: v.barcode ?? "",

        isActive: v.isActive ?? true,

        attributes: (v.attributes ?? []).map(
          (a) => ({
            valueId: a.valueId ?? "",
          })
        ),

        inventories: (
          v.inventories ?? []
        ).map((inv) => ({
          warehouseId:
            inv.warehouseId ?? "",

          stock:
            safeNumber(inv.stock, 0) ?? 0,

          reserved:
            safeNumber(inv.reserved, 0) ?? 0,

          threshold: safeNumber(
            inv.threshold
          ),
        })),
      })),
    }),
    [store]
  );

  /* =========================================================
     FORM
  ========================================================= */

  const form = useForm<FormValues>({
    mode: "onChange",
    resolver: zodResolver(createProductSchema),
    defaultValues,
  });

  const {
    control,
    getValues,
    reset,
    setValue,
  } = form;

  /* =========================================================
     FIELD ARRAYS
  ========================================================= */

  const variants = useFieldArray({
    control,
    name: "variants",
  });

  const specifications = useFieldArray({
    control,
    name: "specifications",
  });

  const medias = useFieldArray({
    control,
    name: "medias",
  });

  const oemNumbers = useFieldArray({
    control,
    name: "oemNumbers",
  });

  const fitments = useFieldArray({
    control,
    name: "productFitments",
  });

  /* =========================================================
     WATCH
  ========================================================= */

  const watchedValues = useWatch({
    control,
  });

  /* =========================================================
     STORE SYNC
  ========================================================= */

  const lastSyncRef = useRef<string>("");

  useEffect(() => {
    if (!watchedValues) return;

    const payload = {
      name: watchedValues.name ?? "",

      description:
        watchedValues.description ?? "",

      brandId: watchedValues.brandId ?? "",

      categoryId:
        watchedValues.categoryId ?? "",

      isActive:
        watchedValues.isActive ?? true,

      isFeatured:
        watchedValues.isFeatured ?? false,

      searchKeywords:
        watchedValues.searchKeywords ?? "",

      variants: watchedValues.variants ?? [],

      specifications:
        watchedValues.specifications ?? [],

      productFitments:
        watchedValues.productFitments ?? [],

      medias: watchedValues.medias ?? [],

      oemNumbers:
        watchedValues.oemNumbers ?? [],
    };

    const serialized =
      JSON.stringify(payload);

    if (serialized === lastSyncRef.current) {
      return;
    }

    lastSyncRef.current = serialized;

    /* =====================================================
       PRODUCT
    ===================================================== */

    store.setProduct("name", payload.name);

    store.setProduct(
      "description",
      payload.description
    );

    store.setProduct(
      "brandId",
      payload.brandId
    );

    store.setProduct(
      "categoryId",
      payload.categoryId
    );

    store.setProduct(
      "isActive",
      payload.isActive
    );

    store.setProduct(
      "isFeatured",
      payload.isFeatured
    );

    store.setProduct(
      "searchKeywords",
      payload.searchKeywords
    );

    /* =====================================================
       BATCH UPDATE
    ===================================================== */

    useProductBuilder.setState({
      variants: payload.variants as any,

      specifications:
        payload.specifications as any,

      fitments:
        payload.productFitments as any,

      medias: payload.medias as any,

      oemNumbers:
        payload.oemNumbers as any,
    });
  }, [watchedValues, store]);

  /* =========================================================
     MANUAL SAVE ONLY
  ========================================================= */

  const handleSave = async () => {
    const rawValues = getValues();

    const parsed =
      createProductSchema.safeParse(
        rawValues
      );

    if (!parsed.success) {
      console.log(parsed.error.flatten());
      return;
    }

    const data: ParsedValues = parsed.data;

    const payload: CreateProductInput = {
      id: data.id,

      name: data.name,

      description: data.description,

      brandId: data.brandId,

      categoryId: data.categoryId,

      isActive: data.isActive,

      isFeatured: data.isFeatured,

      searchKeywords:
        data.searchKeywords,

      oemNumbers: (
        data.oemNumbers ?? []
      ).map((oem) => ({
        oemNumber: oem.oemNumber,
      })),

      specifications: (
        data.specifications ?? []
      ).map((spec) => ({
        name: spec.name,
        value: spec.value,
      })),

      productFitments: (
        data.productFitments ?? []
      ).map((fitment) => ({
        trimId: fitment.trimId,
        notes: fitment.notes,
      })),

      medias: (data.medias ?? []).map(
        (media, index) => ({
          id: media.id,
          url: media.url,
          type: media.type,

          position:
            safeNumber(
              media.position,
              index
            ) ?? index,
        })
      ),

      variants: (
        data.variants ?? []
      ).map((variant) => ({
        id: variant.id,

        name: variant.name,

        sku: variant.sku,

        price:
          safeNumber(
            variant.price,
            0
          ) ?? 0,

        costPrice: safeNumber(
          variant.costPrice
        ),

        compareAtPrice: safeNumber(
          variant.compareAtPrice
        ),

        weight: safeNumber(
          variant.weight
        ),

        length: safeNumber(
          variant.length
        ),

        width: safeNumber(
          variant.width
        ),

        height: safeNumber(
          variant.height
        ),

        barcode:
          variant.barcode || undefined,

        isActive:
          variant.isActive ?? true,

        attributes: (
          variant.attributes ?? []
        ).map((attr) => ({
          valueId: attr.valueId,
        })),

        inventories: (
          variant.inventories ?? []
        ).map((inv) => ({
          warehouseId:
            inv.warehouseId,

          stock:
            safeNumber(
              inv.stock,
              0
            ) ?? 0,

          reserved:
            safeNumber(
              inv.reserved,
              0
            ) ?? 0,

          threshold: safeNumber(
            inv.threshold
          ),
        })),
      })),
    };

    if (
      !payload.name ||
      !payload.brandId ||
      !payload.categoryId
    ) {
      return;
    }

    console.log("PRODUCT PAYLOAD:", payload);

    await createProduct(payload).unwrap();
  };

  /* =========================================================
     RESET
  ========================================================= */

  const handleReset = () => {
    reset(defaultValues);

    store.reset();

    lastSyncRef.current = "";
  };

  /* =========================================================
     RETURN
  ========================================================= */

  return {
    form,

    variants,
    specifications,
    medias,
    oemNumbers,
    fitments,

    save: handleSave,

    reset: handleReset,

    getValues,
    setValue,

    store,
  };
}