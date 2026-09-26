import { useEffect, useState } from "react";
import { api } from "../services/api";

interface Kpis {
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  pending_receipts: number;
  pending_deliveries: number;
  scheduled_transfers: number;
}

const DOC_TYPES = ["Receipts", "Delivery", "Internal", "Adjustments"];
const STATUSES = ["Draft", "Waiting", "Ready", "Done", "Canceled"];

export default function Dashboard() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [docType, setDocType] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    api.get<Kpis>("/dashboard/kpis").then((r) => setKpis(r.data));
  }, []);

  const cards = kpis
    ? [
        { label: "Total Products in Stock", value: kpis.total_products },
        { label: "Low Stock Items", value: kpis.low_stock_count },
        { label: "Out of Stock Items", value: kpis.out_of_stock_count },
        { label: "Pending Receipts", value: kpis.pending_receipts },
        { label: "Pending Deliveries", value: kpis.pending_deliveries },
        { label: "Internal Transfers Scheduled", value: kpis.scheduled_transfers },
      ]
    : [];

  return (
    <div>
      <h2>Dashboard</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 13, color: "#6b7280" }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 600 }}>{c.value ?? "—"}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <select value={docType} onChange={(e) => setDocType(e.target.value)}>
          <option value="">All document types</option>
          {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {/* TODO: wire warehouse + category filters once those endpoints support filtering by them */}
      </div>

      <p style={{ color: "#6b7280", fontSize: 14 }}>
        Filtered activity feed goes here — combine /dashboard/move-history with the selected
        document type / status / warehouse / category filters above.
      </p>
    </div>
  );
}
