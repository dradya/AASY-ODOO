interface Column<T> {
  key: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
}

export default function DataTable<T extends { id: string }>({ columns, rows, emptyMessage = "No records found" }: Props<T>) {
  if (rows.length === 0) {
    return <p style={{ color: "#6b7280", padding: 24, textAlign: "center" }}>{emptyMessage}</p>;
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
          {columns.map((col) => (
            <th key={String(col.key)} style={{ padding: "10px 12px", fontSize: 13, color: "#6b7280" }}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
            {columns.map((col) => (
              <td key={String(col.key)} style={{ padding: "10px 12px", fontSize: 14 }}>
                {col.render ? col.render(row) : String(row[col.key] ?? "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
