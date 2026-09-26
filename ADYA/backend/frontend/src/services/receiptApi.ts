import { api } from "./api";

export interface DocumentLine {
  product_id: string;
  location_id: string;
  quantity: number;
}

export const receiptApi = {
  list: (status?: string) => api.get("/receipts/", { params: { status } }).then((r) => r.data),

  create: (payload: { warehouse_id: string; supplier_name?: string; lines: DocumentLine[] }) =>
    api.post("/receipts/", payload).then((r) => r.data),

  validate: (id: string) => api.post(`/receipts/${id}/validate`).then((r) => r.data),
};
