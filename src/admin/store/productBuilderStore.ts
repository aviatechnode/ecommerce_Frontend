import { create } from "zustand";

import type {
  CreateProductInput,
  ProductMedia,
  ProductVariant,
} from "../../schemas/product.schema";

/* =========================================================
DERIVED TYPES FROM ZOD SCHEMA
========================================================= */

type ProductState =
  Omit<
    CreateProductInput,
    | "variants"
    | "specifications"
    | "productFitments"
    | "medias"
    | "oemNumbers"
  > & {
    id?: string;
  };

type ProductSpecification =
  CreateProductInput["specifications"][number];

type ProductFitment =
  CreateProductInput["productFitments"][number];

type ProductOEMNumber =
  CreateProductInput["oemNumbers"][number];

/* =========================================================
STORE
========================================================= */

interface Store {
  step: number;

  product: ProductState;

  variants: ProductVariant[];

  specifications: ProductSpecification[];

  fitments: ProductFitment[];

  medias: ProductMedia[];

  oemNumbers: ProductOEMNumber[];

  /* =======================================================
  PRODUCT
  ======================================================= */

  setProduct: <
    K extends keyof ProductState
  >(
    field: K,
    value: ProductState[K]
  ) => void;

  /* =======================================================
  VARIANTS
  ======================================================= */

  addVariant: (
    payload?: Partial<ProductVariant>
  ) => void;

  updateVariant: <
    K extends keyof ProductVariant
  >(
    id: string,
    field: K,
    value: ProductVariant[K]
  ) => void;

  removeVariant: (
    id: string
  ) => void;

  /* =======================================================
  SPECIFICATIONS
  ======================================================= */

  addSpec: () => void;

  updateSpec: <
    K extends keyof ProductSpecification
  >(
    index: number,
    field: K,
    value: ProductSpecification[K]
  ) => void;

  removeSpec: (
    index: number
  ) => void;

  /* =======================================================
  FITMENTS
  ======================================================= */

  addFitment: (
    fitment?: Partial<ProductFitment>
  ) => void;

  updateFitment: <
    K extends keyof ProductFitment
  >(
    index: number,
    field: K,
    value: ProductFitment[K]
  ) => void;

  removeFitment: (
    index: number
  ) => void;

  /* =======================================================
  OEM NUMBERS
  ======================================================= */

  addOEMNumber: () => void;

  updateOEMNumber: (
    index: number,
    value: string
  ) => void;

  removeOEMNumber: (
    index: number
  ) => void;

  /* =======================================================
  MEDIA
  ======================================================= */

  setMedias: (
    medias: ProductMedia[]
  ) => void;

  /* =======================================================
  STEP
  ======================================================= */

  nextStep: () => void;

  prevStep: () => void;

  /* =======================================================
  RESET
  ======================================================= */

  reset: () => void;
}

/* =========================================================
INITIAL STATE
========================================================= */

const initialState: Pick<
  Store,
  | "step"
  | "product"
  | "variants"
  | "specifications"
  | "fitments"
  | "medias"
  | "oemNumbers"
> = {
  step: 1,

  product: {
    id: undefined,

    name: "",

    description: undefined,

    brandId: "",

    categoryId: "",

    isActive: true,

    isFeatured: false,

    searchKeywords: undefined,
  },

  variants: [],

  specifications: [],

  fitments: [],

  medias: [],

  oemNumbers: [],
};

/* =========================================================
STORE
========================================================= */

export const useProductBuilder =
  create<Store>((set) => ({
    ...initialState,

    /* =====================================================
    PRODUCT
    ===================================================== */

    setProduct: (field, value) =>
      set((state) => ({
        product: {
          ...state.product,

          [field]: value,
        },
      })),

    /* =====================================================
    VARIANTS
    ===================================================== */

    addVariant: (payload = {}) =>
      set((state) => ({
        variants: [
          ...state.variants,

          {
            id: payload.id,

            name:
              payload.name ?? "",

            sku:
              payload.sku?.toUpperCase() ??
              "",

            price:
              payload.price ?? 0,

            costPrice:
              payload.costPrice,

            compareAtPrice:
              payload.compareAtPrice,

            weight:
              payload.weight,

            length:
              payload.length,

            width:
              payload.width,

            height:
              payload.height,

            barcode:
              payload.barcode?.trim() ||
              undefined,

            isActive:
              payload.isActive ??
              true,

            attributes:
              payload.attributes ??
              [],

            inventories:
              payload.inventories ??
              [],
          },
        ],
      })),

    updateVariant: (
      id,
      field,
      value
    ) =>
      set((state) => ({
        variants:
          state.variants.map((v) =>
            v.id !== id
              ? v
              : {
                  ...v,

                  [field]:
                    field === "sku" &&
                    typeof value ===
                      "string"
                      ? value.toUpperCase()
                      : field ===
                            "barcode" &&
                          typeof value ===
                            "string"
                        ? value.trim() ||
                          undefined
                        : value,
                }
          ),
      })),

    removeVariant: (id) =>
      set((state) => ({
        variants:
          state.variants.filter(
            (v) => v.id !== id
          ),
      })),

    /* =====================================================
    SPECIFICATIONS
    ===================================================== */

    addSpec: () =>
      set((state) => ({
        specifications: [
          ...state.specifications,

          {
            name: "",

            value: "",
          },
        ],
      })),

    updateSpec: (
      index,
      field,
      value
    ) =>
      set((state) => {
        const updated = [
          ...state.specifications,
        ];

        if (!updated[index]) {
          return state;
        }

        updated[index] = {
          ...updated[index],

          [field]: value,
        };

        return {
          specifications: updated,
        };
      }),

    removeSpec: (index) =>
      set((state) => ({
        specifications:
          state.specifications.filter(
            (_, i) => i !== index
          ),
      })),

    /* =====================================================
    FITMENTS
    ===================================================== */

    addFitment: (
      fitment = {}
    ) =>
      set((state) => ({
        fitments: [
          ...state.fitments,

          {
            id: fitment.id,

            trimId:
              fitment.trimId ?? "",

            notes:
              fitment.notes ??
              undefined,
          },
        ],
      })),

    updateFitment: (
      index,
      field,
      value
    ) =>
      set((state) => {
        const updated = [
          ...state.fitments,
        ];

        if (!updated[index]) {
          return state;
        }

        updated[index] = {
          ...updated[index],

          [field]: value,
        };

        return {
          fitments: updated,
        };
      }),

    removeFitment: (
      index
    ) =>
      set((state) => ({
        fitments:
          state.fitments.filter(
            (_, i) => i !== index
          ),
      })),

    /* =====================================================
    OEM NUMBERS
    ===================================================== */

    addOEMNumber: () =>
      set((state) => ({
        oemNumbers: [
          ...state.oemNumbers,

          {
            oemNumber: "",
          },
        ],
      })),

    updateOEMNumber: (
      index,
      value
    ) =>
      set((state) => {
        const updated = [
          ...state.oemNumbers,
        ];

        if (!updated[index]) {
          return state;
        }

        updated[index] = {
          ...updated[index],

          oemNumber:
            value.trim(),
        };

        return {
          oemNumbers: updated,
        };
      }),

    removeOEMNumber: (
      index
    ) =>
      set((state) => ({
        oemNumbers:
          state.oemNumbers.filter(
            (_, i) => i !== index
          ),
      })),

    /* =====================================================
    MEDIA
    ===================================================== */

    setMedias: (medias) =>
      set({
        medias: medias.map(
          (m, index) => ({
            id: m.id,

            url:
              m.url ?? "",

            type:
              m.type === "VIDEO"
                ? "VIDEO"
                : "IMAGE",

            position:
              typeof m.position ===
              "number"
                ? m.position
                : index,
          })
        ),
      }),

    /* =====================================================
    STEP
    ===================================================== */

    nextStep: () =>
      set((state) => ({
        step: state.step + 1,
      })),

    prevStep: () =>
      set((state) => ({
        step:
          state.step > 1
            ? state.step - 1
            : 1,
      })),

    /* =====================================================
    RESET
    ===================================================== */

    reset: () =>
      set(initialState),
  }));

  export type {
  ProductVariant,
  ProductMedia,
  ProductSpecification,
  ProductFitment,
  ProductOEMNumber,
};