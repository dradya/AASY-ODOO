import { useEffect, useState } from "react";
import { api } from "../services/api";
import DataTable from "../components/DataTable";
import Button from "../components/Button";

interface Warehouse {
  id: string;
  name: string;
  code: string;
  locations: { id: string; name: string }[];
}

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    api.get<Warehouse[]>("/warehouses/").then((r) => setWarehouses(r.data));
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Warehouse Settings</h2>
        {/* TODO: "+ New Warehouse" opens create form (name, code); backend auto-creates a default location */}
        <Button>+ New Warehouse</Button>
      </div>

      <DataTable
        rows={warehouses}
        columns={[
          { key: "name", label: "Name" },
          { key: "code", label: "Code" },
          { key: "locations", label: "Locations", render: (w) => w.locations?.map((l) => l.name).join(", ") },
        ]}
      />
    </div>
  );
}
