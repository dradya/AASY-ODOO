import { useEffect, useState } from "react";
import { api } from "../services/api";
import DataTable from "../components/DataTable";
import { formatDate } from "../utils/helpers";

interface Movement {
  id: string;
  quantity: number;
  movement_type: string;
  created_at: string;
  products: { sku: string; name: string };
  locations: { name: string };
}

export default function MoveHistory() {
  const [movements, setMovements] = useState<Movement[]>([]);

  useEffect(() => {
    api.get<Movement[]>("/dashboard/move-history").then((r) => setMovements(r.data));
  }, []);

  return (
    <div>
      <h2>Move History (Stock Ledger)</h2>
      <DataTable
        rows={movements}
        columns={[
          { key: "id", label: "Product", render: (m) => `${m.products?.name} (${m.products?.sku})` },
          { key: "locations", label: "Location", render: (m) => m.locations?.name },
          { key: "movement_type", label: "Type" },
          { key: "quantity", label: "Qty", render: (m) => (m.quantity > 0 ? `+${m.quantity}` : `${m.quantity}`) },
          { key: "created_at", label: "When", render: (m) => formatDate(m.created_at) },
        ]}
      />
    </div>
  );
}
