import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/products", label: "Products" },
  { to: "/receipts", label: "Receipts" },
  { to: "/deliveries", label: "Delivery Orders" },
  { to: "/transfers", label: "Internal Transfers" },
  { to: "/adjustments", label: "Adjustments" },
  { to: "/move-history", label: "Move History" },
  { to: "/warehouses", label: "Warehouses" },
  { to: "/profile", label: "Profile" },
];

export default function Sidebar() {
  return (
    <nav style={{ width: 220, background: "#111827", height: "100vh", padding: "16px 0" }}>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          style={({ isActive }) => ({
            display: "block",
            padding: "10px 20px",
            color: isActive ? "#fff" : "#9ca3af",
            background: isActive ? "#1f2937" : "transparent",
            textDecoration: "none",
            fontSize: 14,
          })}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
