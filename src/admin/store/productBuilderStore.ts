import { create } from "zustand";

//////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////

export type Variant = {
  id: string;

  name: string;
  sku: string;

  price: number;
  costPrice?: number;
  compareAtPrice?: number;

  weight?: number;
  length?: number;
  width?: number;
  height?: number;

  barcode?: string;
  isActive?: boolean;

  attributes: {
    valueId: string;
  }[];

  inventories: {
    warehouseId: string;
    stock: number;
    reserved?: number;
    threshold?: number;
  }[];
};

export type Specification = {
  name: string;
  value: string;
};

export type Fitment = {
  trimId: string;
  notes?: string;
};

export type Media = {
  url: string;
  type: "IMAGE" | "VIDEO";
  position?: number;
};

export type OEMNumber = {
  oemNumber: string;
};

//////////////////////////////////////////////////////////
// STORE INTERFACE
//////////////////////////////////////////////////////////

interface Store {
  step: number;

  product: {
    name: string;
    description?: string;

    brandId: string;
    categoryId: string;

    isActive: boolean;
    isFeatured: boolean;

    searchKeywords?: string;
  };

  variants: Variant[];
  specifications: Specification[];
  fitments: Fitment[];
  medias: Media[];
  oemNumbers: OEMNumber[];

  setProduct: <K extends keyof Store["product"]>(
    field: K,
    value: Store["product"][K]
  ) => void;

  addVariant: (payload?: Partial<Variant>) => void;
  updateVariant: (id: string, field: keyof Variant, value: any) => void;
  removeVariant: (id: string) => void;

  addSpec: () => void;
  updateSpec: (index: number, field: keyof Specification, value: string) => void;
  removeSpec: (index: number) => void;

  addFitment: (fitment: Fitment) => void;
  removeFitment: (index: number) => void;

  addOEMNumber: () => void;
  updateOEMNumber: (index: number, value: string) => void;
  removeOEMNumber: (index: number) => void;

  setMedias: (files: Media[]) => void;

  nextStep: () => void;
  prevStep: () => void;

  reset: () => void;
}

//////////////////////////////////////////////////////////
// STORE IMPLEMENTATION
//////////////////////////////////////////////////////////

export const useProductBuilder = create<Store>((set) => ({
  step: 1,

  product: {
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

  //////////////////////////////////////////////////////////
  // PRODUCT
  //////////////////////////////////////////////////////////

  setProduct: (field, value) =>
    set((state) => ({
      product: {
        ...state.product,
        [field]: value,
      },
    })),

  //////////////////////////////////////////////////////////
  // VARIANTS
  //////////////////////////////////////////////////////////

  addVariant: () =>
    set((state) => ({
      variants: [
        ...state.variants,
        {
          id:
            typeof crypto !== "undefined"
              ? crypto.randomUUID()
              : String(Date.now()),

          name: "",
          sku: "",

          price: 0,
          costPrice: undefined,
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
      ],
    })),

  updateVariant: (id, field, value) =>
    set((state) => ({
      variants: state.variants.map((v) =>
        v.id !== id
          ? v
          : {
              ...v,
              [field]:
                typeof value === "string" &&
                [
                  "price",
                  "costPrice",
                  "compareAtPrice",
                  "weight",
                  "length",
                  "width",
                  "height",
                ].includes(field as string)
                  ? Number(value)
                  : value,
            }
      ),
    })),

  removeVariant: (id) =>
    set((state) => ({
      variants: state.variants.filter((v) => v.id !== id),
    })),

  //////////////////////////////////////////////////////////
  // SPECIFICATIONS
  //////////////////////////////////////////////////////////

  addSpec: () =>
    set((state) => ({
      specifications: [...state.specifications, { name: "", value: "" }],
    })),

  updateSpec: (index, field, value) =>
    set((state) => {
      const specs = [...state.specifications];

      if (!specs[index]) return state;

      specs[index] = {
        ...specs[index],
        [field]: value,
      };

      return { specifications: specs };
    }),

  removeSpec: (index) =>
    set((state) => ({
      specifications: state.specifications.filter((_, i) => i !== index),
    })),

  //////////////////////////////////////////////////////////
  // FITMENTS
  //////////////////////////////////////////////////////////

  addFitment: (fitment) =>
    set((state) => ({
      fitments: [...state.fitments, fitment],
    })),

  removeFitment: (index) =>
    set((state) => ({
      fitments: state.fitments.filter((_, i) => i !== index),
    })),

  //////////////////////////////////////////////////////////
  // OEM NUMBERS
  //////////////////////////////////////////////////////////

  addOEMNumber: () =>
    set((state) => ({
      oemNumbers: [...state.oemNumbers, { oemNumber: "" }],
    })),

  updateOEMNumber: (index, value) =>
    set((state) => {
      const updated = [...state.oemNumbers];

      if (!updated[index]) return state;

      updated[index] = { oemNumber: value };

      return { oemNumbers: updated };
    }),

  removeOEMNumber: (index) =>
    set((state) => ({
      oemNumbers: state.oemNumbers.filter((_, i) => i !== index),
    })),

  //////////////////////////////////////////////////////////
  // MEDIA
  //////////////////////////////////////////////////////////

  setMedias: (files) =>
    set({
      medias: files.map((m, i) => ({
        url: m.url,
        type: m.type,
        position: m.position ?? i,
      })),
    }),

  //////////////////////////////////////////////////////////
  // STEP CONTROL
  //////////////////////////////////////////////////////////

  nextStep: () =>
    set((state) => ({
      step: state.step + 1,
    })),

  prevStep: () =>
    set((state) => ({
      step: state.step - 1,
    })),

  //////////////////////////////////////////////////////////
  // RESET
  //////////////////////////////////////////////////////////

  reset: () =>
    set({
      step: 1,

      product: {
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
    }),
}));