import { create } from "zustand";

/* ================= TYPES ================= */

type Variant = {
  id: string;
  name: string;
  sku: string;
  price: string;
  costPrice?: string;

  weight?: number;
  length?: number;
  width?: number;
  height?: number;

  attributes: {
    attributeId: string;
    valueId: string;
  }[];

  inventories: {
    warehouseId: string;
    stock: string;
    threshold?: string;
  }[];
};

type Specification = {
  name: string;
  value: string;
};

type Fitment = {
  trimId: string;
  notes?: string;
};

/* ================= STORE ================= */

interface Store {
  step: number;

  product: {
    name: string;
    description: string;
    brandId: string;
    categoryId: string;
    oemNumber?: string;

    isActive: boolean; // ✅ FIXED (missing before)
  };

  variants: Variant[];
  specifications: Specification[];
  fitments: Fitment[];
  images: File[];

  /* ACTIONS */
  setProduct: (field: keyof Store["product"], value: any) => void;

  addVariant: () => void;
  updateVariant: (id: string, field: string, value: any) => void;
  removeVariant: (id: string) => void;

  addSpec: () => void;
  updateSpec: (index: number, field: string, value: string) => void;
  removeSpec: (index: number) => void;

  addFitment: (fitment: Fitment) => void;
  removeFitment: (index: number) => void;

  setImages: (files: File[]) => void;

  nextStep: () => void;
  prevStep: () => void;

  reset: () => void;
}

/* ================= STORE IMPLEMENTATION ================= */

export const useProductBuilder = create<Store>((set) => ({
  step: 1,

  product: {
    name: "",
    description: "",
    brandId: "",
    categoryId: "",
    oemNumber: "",
    isActive: true, // ✅ FIXED DEFAULT
  },

  variants: [],
  specifications: [],
  fitments: [],
  images: [],

  setProduct: (field, value) =>
    set((state) => ({
      product: {
        ...state.product,
        [field]: value,
      },
    })),

  addVariant: () =>
    set((state) => ({
      variants: [
        ...state.variants,
        {
          id: crypto.randomUUID(),
          name: "",
          sku: "",
          price: "",
          costPrice: "",
          weight: undefined,
          length: undefined,
          width: undefined,
          height: undefined,
          attributes: [],
          inventories: [],
        },
      ],
    })),

  updateVariant: (id, field, value) =>
    set((state) => ({
      variants: state.variants.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      ),
    })),

  removeVariant: (id) =>
    set((state) => ({
      variants: state.variants.filter((v) => v.id !== id),
    })),

  addSpec: () =>
    set((state) => ({
      specifications: [...state.specifications, { name: "", value: "" }],
    })),

  updateSpec: (index, field, value) =>
    set((state) => {
      const specs = [...state.specifications];
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

  addFitment: (fitment) =>
    set((state) => ({
      fitments: [...state.fitments, fitment],
    })),

  removeFitment: (index) =>
    set((state) => ({
      fitments: state.fitments.filter((_, i) => i !== index),
    })),

  setImages: (files) => set({ images: files }),

  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: state.step - 1 })),

  reset: () =>
    set({
      step: 1,
      product: {
        name: "",
        description: "",
        brandId: "",
        categoryId: "",
        oemNumber: "",
        isActive: true,
      },
      variants: [],
      specifications: [],
      fitments: [],
      images: [],
    }),
}));