import { useState, FormEvent } from "react";
import { useProducts } from "../hooks/useProducts";
import { productApi } from "../services/productApi";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import Button from "../components/Button";

export default function Products() {
  const [search, setSearch] = useState("");
  const { products, loading, error } = useProducts({ search });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ sku: "", name: "", unit_of_measure: "unit", reorder_point: 0 });

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await productApi.create(form);
    setShowModal(false);
    window.location.reload(); // TODO: replace with query refetch/cache invalidation
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Products</h2>
        <Button onClick={() => setShowModal(true)}>+ New Product</Button>
      </div>

      <input
        placeholder="Search by name or SKU..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: 8, marginBottom: 16, width: 300 }}
      />

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      {!loading && !error && (
        <DataTable
          rows={products}
          columns={[
            { key: "sku", label: "SKU" },
            { key: "name", label: "Name" },
            { key: "unit_of_measure", label: "UoM" },
            { key: "reorder_point", label: "Reorder point" },
          ]}
        />
      )}

      <Modal open={showModal} title="New Product" onClose={() => setShowModal(false)}>
        <form onSubmit={handleCreate}>
          <input placeholder="SKU" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
            style={{ width: "100%", padding: 8, marginBottom: 8 }} />
          <input placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ width: "100%", padding: 8, marginBottom: 8 }} />
          <input placeholder="Unit of measure" required value={form.unit_of_measure}
            onChange={(e) => setForm({ ...form, unit_of_measure: e.target.value })}
            style={{ width: "100%", padding: 8, marginBottom: 8 }} />
          <input type="number" placeholder="Reorder point" value={form.reorder_point}
            onChange={(e) => setForm({ ...form, reorder_point: Number(e.target.value) })}
            style={{ width: "100%", padding: 8, marginBottom: 16 }} />
          <Button type="submit">Save</Button>
        </form>
      </Modal>
    </div>
  );
}
