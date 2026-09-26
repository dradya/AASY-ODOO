export function formatQuantity(qty: number, unit: string): string {
  return `${qty.toLocaleString()} ${unit}`;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    draft: "#9ca3af",
    waiting: "#f59e0b",
    ready: "#3b82f6",
    done: "#10b981",
    canceled: "#ef4444",
  };
  return map[status] ?? "#9ca3af";
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}
