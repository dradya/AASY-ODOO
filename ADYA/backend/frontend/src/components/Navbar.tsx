import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header style={{
      height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", background: "#fff", borderBottom: "1px solid #e5e7eb",
    }}>
      <strong>StockSense</strong>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 14, color: "#6b7280" }}>{user?.email}</span>
        <button onClick={() => signOut()}>Logout</button>
      </div>
    </header>
  );
}
