import { useEffect, useState } from "react";
import { deliveryApi } from "../services/deliveryApi";
import DataTable from "../components/DataTable";
import Button from "../components/Button";
import { statusColor, formatDate } from "../utils/helpers";

interface Delivery {
  id: string;
  reference: string;
  customer_name: string;
  status: string;
  created_at: string;
}

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  const load = () => deliveryApi.list(statusFilter || undefined).then(setDeliveries);
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [statusFilter]);

  const validate = async (id: string) => {
    await deliveryApi.validate(id);
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Delivery Orders (Outgoing Stock)</h2>
        {/* TODO: "+ New Delivery" opens create form: pick items -> pack items -> validate */}
        <Button>+ New Delivery</Button>
      </div>

      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ marginBottom: 16 }}>
        <option value="">All statuses</option>
        {["draft", "waiting", "ready", "done", "canceled"].map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <DataTable
        rows={deliveries}
        columns={[
          { key: "reference", label: "Reference" },
          { key: "customer_name", label: "Customer" },
          { key: "status", label: "Status", render: (d) => <span style={{ color: statusColor(d.status) }}>{d.status}</span> },
          { key: "created_at", label: "Created", render: (d) => formatDate(d.created_at) },
          {
            key: "id", label: "", render: (d) =>
              d.status !== "done" && d.status !== "canceled"
                ? <Button variant="secondary" onClick={() => validate(d.id)}>Validate</Button>
                : null,
          },
        ]}
      />
    </div>
  );
}
