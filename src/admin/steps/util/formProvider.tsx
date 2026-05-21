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

const safeString = (
  value: unknown
): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length
    ? trimmed
    : undefined;
};

/* =========================================================
   HOOK
========================================================= */

export function useProductForm() {
  const [createProduct] =
    useCreateProductMutation();

  const store = useProductBuilder();

  /* =========================================================
     DEFAULT VALUES
  ========================================================= */

  const defaultValues: FormValues = useMemo(
    () => ({
      id: store.product.id ?? undefined,

      slug: store.product.slug ?? "",

      name: store.product.name ?? "",

      description:
        store.product.description ?? "",

      brandId:
        store.product.brandId ?? "",

      categoryId:
        store.product.categoryId ?? "",

      isActive:
        store.product.isActive ?? true,

      isFeatured:
        store.product.isFeatured ?? false,

      searchKeywords:
        store.product.searchKeywords ?? "",

      oemNumbers: store.oemNumbers.map(
        (i) => ({
          id: i.id,
          oemNumber:
            i.oemNumber ?? "",
        })
      ),

      specifications:
        store.specifications.map((s) => ({
          id: s.id,
          name: s.name ?? "",
          value: s.value ?? "",
        })),

      productFitments:
        store.fitments.map((f) => ({
          id: f.id,

          level:
            f.level ?? "TRIM",

          makeId:
            f.makeId ?? undefined,

          modelId:
            f.modelId ?? undefined,

          generationId:
            f.generationId ??
            undefined,

          engineId:
            f.engineId ?? undefined,

          trimId:
            f.trimId ?? undefined,

          yearStart:
            safeNumber(
              f.yearStart
            ),

          yearEnd:
            safeNumber(
              f.yearEnd
            ),

          notes:
            f.notes ?? "",

          position:
            f.position ?? "",

          quantityRequired:
            safeNumber(
              f.quantityRequired
            ),

          isUniversal:
            f.isUniversal ?? false,
        })),

      medias: store.medias.map(
        (m, index) => ({
          id: m.id,

          url: m.url ?? "",

          type:
            m.type ?? "IMAGE",

          position:
            safeNumber(
              m.position,
              index
            ) ?? index,
        })
      ),

      variants: store.variants.map(
        (v) => ({
          id: v.id,

          name: v.name ?? "",

          sku: v.sku ?? "",

          price:
            safeNumber(
              v.price,
              0
            ) ?? 0,

          costPrice:
            safeNumber(
              v.costPrice
            ),

          compareAtPrice:
            safeNumber(
              v.compareAtPrice
            ),

          weight:
            safeNumber(
              v.weight
            ),

          length:
            safeNumber(
              v.length
            ),

          width:
            safeNumber(
              v.width
            ),

          height:
            safeNumber(
              v.height
            ),

          barcode:
            v.barcode ?? "",

          isActive:
            v.isActive ?? true,

          attributes: (
            v.attributes ?? []
          ).map((a) => ({
            id: a.id,
            valueId:
              a.valueId ?? "",
          })),

          inventories: (
            v.inventories ?? []
          ).map((inv) => ({
            id: inv.id,

            warehouseId:
              inv.warehouseId ??
              "",

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

            threshold:
              safeNumber(
                inv.threshold
              ),
          })),
        })
      ),
    }),
    [store]
  );

  /* =========================================================
     FORM
  ========================================================= */

  const form = useForm<FormValues>({
    mode: "onChange",

    resolver: zodResolver(
      createProductSchema
    ),

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

  const specifications =
    useFieldArray({
      control,
      name: "specifications",
    });

  const medias = useFieldArray({
    control,
    name: "medias",
  });

  const oemNumbers =
    useFieldArray({
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

  const lastSyncRef =
    useRef<string>("");

  useEffect(() => {
    if (!watchedValues) return;

    const payload = {
      id: watchedValues.id,

      slug:
        watchedValues.slug ?? "",

      name:
        watchedValues.name ?? "",

      description:
        watchedValues.description ??
        "",

      brandId:
        watchedValues.brandId ?? "",

      categoryId:
        watchedValues.categoryId ??
        "",

      isActive:
        watchedValues.isActive ??
        true,

      isFeatured:
        watchedValues.isFeatured ??
        false,

      searchKeywords:
        watchedValues.searchKeywords ??
        "",

      variants:
        watchedValues.variants ?? [],

      specifications:
        watchedValues.specifications ??
        [],

      productFitments:
        watchedValues.productFitments ??
        [],

      medias:
        watchedValues.medias ?? [],

      oemNumbers:
        watchedValues.oemNumbers ??
        [],
    };

    const serialized =
      JSON.stringify(payload);

    if (
      serialized ===
      lastSyncRef.current
    ) {
      return;
    }

    lastSyncRef.current =
      serialized;

    /* =====================================================
       PRODUCT
    ===================================================== */

    store.setProduct(
      "id",
      payload.id
    );

    store.setProduct(
      "slug",
      payload.slug
    );

    store.setProduct(
      "name",
      payload.name
    );

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
      variants:
        payload.variants as any,

      specifications:
        payload.specifications as any,

      fitments:
        payload.productFitments as any,

      medias:
        payload.medias as any,

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
      console.log(
        parsed.error.flatten()
      );

      return;
    }

    const data: ParsedValues =
      parsed.data;

    const payload: CreateProductInput =
      {
        id: data.id,

        slug:
          safeString(data.slug),

        name: data.name,

        description:
          safeString(
            data.description
          ),

        brandId: data.brandId,

        categoryId:
          data.categoryId,

        isActive:
          data.isActive,

        isFeatured:
          data.isFeatured,

        searchKeywords:
          safeString(
            data.searchKeywords
          ),

        oemNumbers: (
          data.oemNumbers ?? []
        ).map((oem) => ({
          id: oem.id,

          oemNumber:
            oem.oemNumber,
        })),

        specifications: (
          data.specifications ??
          []
        ).map((spec) => ({
          id: spec.id,

          name: spec.name,

          value: spec.value,
        })),

        productFitments: (
          data.productFitments ??
          []
        ).map((fitment) => ({
          id: fitment.id,

          level:
            fitment.level,

          makeId:
            fitment.makeId,

          modelId:
            fitment.modelId,

          generationId:
            fitment.generationId,

          engineId:
            fitment.engineId,

          trimId:
            fitment.trimId,

          yearStart:
            safeNumber(
              fitment.yearStart
            ),

          yearEnd:
            safeNumber(
              fitment.yearEnd
            ),

          notes:
            safeString(
              fitment.notes
            ),

          position:
            safeString(
              fitment.position
            ),

          quantityRequired:
            safeNumber(
              fitment.quantityRequired
            ),

          isUniversal:
            fitment.isUniversal ??
            false,
        })),

        medias: (
          data.medias ?? []
        ).map(
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

          name:
            variant.name,

          sku:
            variant.sku,

          price:
            safeNumber(
              variant.price,
              0
            ) ?? 0,

          costPrice:
            safeNumber(
              variant.costPrice
            ),

          compareAtPrice:
            safeNumber(
              variant.compareAtPrice
            ),

          weight:
            safeNumber(
              variant.weight
            ),

          length:
            safeNumber(
              variant.length
            ),

          width:
            safeNumber(
              variant.width
            ),

          height:
            safeNumber(
              variant.height
            ),

          barcode:
            safeString(
              variant.barcode
            ),

          isActive:
            variant.isActive ??
            true,

          attributes: (
            variant.attributes ??
            []
          ).map((attr) => ({
            id: attr.id,

            valueId:
              attr.valueId,
          })),

          inventories: (
            variant.inventories ??
            []
          ).map((inv) => ({
            id: inv.id,

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

            threshold:
              safeNumber(
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

    console.log(
      "PRODUCT PAYLOAD:",
      payload
    );

    await createProduct(
      payload
    ).unwrap();
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