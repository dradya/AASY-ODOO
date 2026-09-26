import { api } from "./api";

export const transferApi = {
  list: () => api.get("/transfers/").then((r) => r.data),

  create: (payload: {
    source_location_id: string;
    dest_location_id: string;
    lines: { product_id: string; quantity: number }[];
  }) => api.post("/transfers/", payload).then((r) => r.data),

  validate: (id: string) => api.post(`/transfers/${id}/validate`).then((r) => r.data),
};
