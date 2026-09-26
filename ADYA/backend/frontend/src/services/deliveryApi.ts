import { api } from "./api";
import type { DocumentLine } from "./receiptApi";

export const deliveryApi = {
  list: (status?: string) => api.get("/deliveries/", { params: { status } }).then((r) => r.data),

  create: (payload: { warehouse_id: string; customer_name?: string; lines: DocumentLine[] }) =>
    api.post("/deliveries/", payload).then((r) => r.data),

  validate: (id: string) => api.post(`/deliveries/${id}/validate`).then((r) => r.data),
};
