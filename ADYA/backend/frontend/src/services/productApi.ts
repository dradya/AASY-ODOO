import { api } from "./api";

export interface Product {
  id: string;
  sku: string;
  name: string;
  category_id: string | null;
  unit_of_measure: string;
  reorder_point: number;
  reorder_qty: number;
  is_active: boolean;
}

export const productApi = {
  list: (params?: { category_id?: string; search?: string }) =>
    api.get<Product[]>("/products/", { params }).then((r) => r.data),

  get: (id: string) => api.get<Product>(`/products/${id}`).then((r) => r.data),

  create: (payload: Partial<Product>) =>
    api.post<Product>("/products/", payload).then((r) => r.data),

  update: (id: string, payload: Partial<Product>) =>
    api.put<Product>(`/products/${id}`, payload).then((r) => r.data),

  availability: (id: string) =>
    api.get(`/products/${id}/availability`).then((r) => r.data),
};
