import { useEffect, useState } from "react";
import { receiptApi } from "../services/receiptApi";
import DataTable from "../components/DataTable";
import Button from "../components/Button";
import { statusColor, formatDate } from "../utils/helpers";

interface Receipt {
  id: string;
  reference: string;
  supplier_name: string;
  status: string;
  created_at: string;
}

export default function Receipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  const load = () => receiptApi.list(statusFilter || undefined).then(setReceipts);
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [statusFilter]);

  const validate = async (id: string) => {
    await receiptApi.validate(id);
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Receipts (Incoming Stock)</h2>
        {/* TODO: "+ New Receipt" opens a create form with supplier + product lines, mirrors Products modal pattern */}
        <Button>+ New Receipt</Button>
      </div>

      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ marginBottom: 16 }}>
        <option value="">All statuses</option>
        {["draft", "waiting", "ready", "done", "canceled"].map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <DataTable
        rows={receipts}
        columns={[
          { key: "reference", label: "Reference" },
          { key: "supplier_name", label: "Supplier" },
          { key: "status", label: "Status", render: (r) => <span style={{ color: statusColor(r.status) }}>{r.status}</span> },
          { key: "created_at", label: "Created", render: (r) => formatDate(r.created_at) },
          {
            key: "id", label: "", render: (r) =>
              r.status !== "done" && r.status !== "canceled"
                ? <Button variant="secondary" onClick={() => validate(r.id)}>Validate</Button>
                : null,
          },
        ]}
      />
    </div>
  );
}
