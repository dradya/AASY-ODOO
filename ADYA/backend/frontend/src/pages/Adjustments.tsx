import { useEffect, useState } from "react";
import { api } from "../services/api";
import DataTable from "../components/DataTable";
import Button from "../components/Button";
import { statusColor, formatDate } from "../utils/helpers";

interface Adjustment {
  id: string;
  reference: string;
  reason: string;
  status: string;
  created_at: string;
}

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);

  const load = () => api.get<Adjustment[]>("/adjustments/").then((r) => setAdjustments(r.data));
  useEffect(() => { load(); }, []);

  const validate = async (id: string) => {
    await api.post(`/adjustments/${id}/validate`);
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Stock Adjustments</h2>
        {/* TODO: "+ New Adjustment" form: select product/location, enter counted quantity */}
        <Button>+ New Adjustment</Button>
      </div>

      <DataTable
        rows={adjustments}
        columns={[
          { key: "reference", label: "Reference" },
          { key: "reason", label: "Reason" },
          { key: "status", label: "Status", render: (a) => <span style={{ color: statusColor(a.status) }}>{a.status}</span> },
          { key: "created_at", label: "Created", render: (a) => formatDate(a.created_at) },
          {
            key: "id", label: "", render: (a) =>
              a.status !== "done" && a.status !== "canceled"
                ? <Button variant="secondary" onClick={() => validate(a.id)}>Validate</Button>
                : null,
          },
        ]}
      />
    </div>
  );
}
