import { useEffect, useState } from "react";
import { transferApi } from "../services/transferApi";
import DataTable from "../components/DataTable";
import Button from "../components/Button";
import { statusColor, formatDate } from "../utils/helpers";

interface Transfer {
  id: string;
  reference: string;
  status: string;
  created_at: string;
}

export default function Transfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  const load = () => transferApi.list().then(setTransfers);
  useEffect(() => { load(); }, []);

  const validate = async (id: string) => {
    await transferApi.validate(id);
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Internal Transfers</h2>
        {/* TODO: "+ New Transfer" form: source location, dest location, product lines */}
        <Button>+ New Transfer</Button>
      </div>

      <DataTable
        rows={transfers}
        columns={[
          { key: "reference", label: "Reference" },
          { key: "status", label: "Status", render: (t) => <span style={{ color: statusColor(t.status) }}>{t.status}</span> },
          { key: "created_at", label: "Created", render: (t) => formatDate(t.created_at) },
          {
            key: "id", label: "", render: (t) =>
              t.status !== "done" && t.status !== "canceled"
                ? <Button variant="secondary" onClick={() => validate(t.id)}>Validate</Button>
                : null,
          },
        ]}
      />
    </div>
  );
}
