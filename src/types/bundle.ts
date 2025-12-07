// src/types/bundle.ts
export type BundleItem = {
  product_id: string;
  variant_id: string;
  quantity: number;
};

export type Bundle = {
  id: string;
  name: string;
  items: BundleItem[];
  created_at: string;
};