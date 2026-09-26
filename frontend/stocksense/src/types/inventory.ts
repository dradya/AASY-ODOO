// Product
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitOfMeasure: string;
  stockQuantity: number;
  warehouse: string;
  location: string;
  reorderLevel: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Receipt
export interface Receipt {
  id: string;
  receiptNumber: string;
  supplier: string;
  date: string;
  warehouse: string;
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';
  products: ReceiptProduct[];
  notes?: string;
  createdAt: string;
}

export interface ReceiptProduct {
  productId: string;
  productName: string;
  quantity: number;
  unitOfMeasure: string;
}

// Delivery Order
export interface DeliveryOrder {
  id: string;
  deliveryNumber: string;
  customer: string;
  date: string;
  warehouse: string;
  status: 'draft' | 'picking' | 'packing' | 'ready' | 'done' | 'canceled';
  products: DeliveryProduct[];
  notes?: string;
  createdAt: string;
}

export interface DeliveryProduct {
  productId: string;
  productName: string;
  quantity: number;
  unitOfMeasure: string;
}

// Internal Transfer
export interface InternalTransfer {
  id: string;
  transferNumber: string;
  product: string;
  quantity: number;
  sourceLocation: string;
  destinationLocation: string;
  date: string;
  status: 'draft' | 'in-progress' | 'done' | 'canceled';
  notes?: string;
  createdAt: string;
}

// Inventory Adjustment
export interface InventoryAdjustment {
  id: string;
  product: string;
  warehouse: string;
  location: string;
  recordedQuantity: number;
  countedQuantity: number;
  difference: number;
  reason: 'damaged' | 'missing' | 'counting-error' | 'other';
  date: string;
  notes?: string;
  status: 'draft' | 'validated' | 'canceled';
  createdAt: string;
}

// Move History
export interface MoveHistory {
  id: string;
  date: string;
  product: string;
  operationType: 'receipt' | 'delivery' | 'internal-transfer' | 'adjustment';
  source: string;
  destination: string;
  quantity: number;
  reference: string;
  user: string;
  status: 'completed' | 'pending' | 'canceled';
}

// Warehouse
export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  locations: WarehouseLocation[];
  totalStock: number;
  status: 'active' | 'inactive';
}

export interface WarehouseLocation {
  id: string;
  name: string;
  code: string;
  stockQuantity: number;
}

// User
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'inventory-manager' | 'warehouse-staff' | 'admin';
  phone: string;
  avatar?: string;
  createdAt: string;
}

// Dashboard KPIs
export interface DashboardKPIs {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  scheduledTransfers: number;
}

// Recent operation for dashboard
export interface RecentOperation {
  id: string;
  type: 'receipt' | 'delivery' | 'transfer' | 'adjustment';
  reference: string;
  description: string;
  date: string;
  status: string;
}
