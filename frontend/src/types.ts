export type Row = Record<string, unknown> & { id: string }
export type Item = { id?: string; product_id: string; expected_quantity?: number; received_quantity?: number; requested_quantity?: number; delivered_quantity?: number; quantity?: number }
export type Profile = { id: string; full_name: string; email: string; role: 'manager' | 'staff' }
export type Product = Row & { name: string; sku: string; category_id: string | null; unit: string; unit_cost: number; sales_price: number; reorder_level: number; is_active: boolean }
export type Location = Row & { name: string; warehouse_id: string; short_code: string }
export type Document = Row & { reference: string; status: string; warehouse_id?: string; location_id?: string; source_warehouse_id?: string; source_location_id?: string; destination_warehouse_id?: string; destination_location_id?: string; vendor_name?: string; customer_name?: string; scheduled_date?: string; source_document?: string; items?: Item[] }
export type Dashboard = { kpis: Record<string, number>; receipts: Row[]; deliveries: Row[]; low_stock: Row[]; movements: Row[]; warehouses: Row[] }
