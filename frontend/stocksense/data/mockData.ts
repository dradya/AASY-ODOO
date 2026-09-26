import type {
  Product,
  Receipt,
  DeliveryOrder,
  InternalTransfer,
  InventoryAdjustment,
  MoveHistory,
  Warehouse,
  User,
  DashboardKPIs,
  RecentOperation
} from '../types/inventory';

export const mockUser: User = {
  id: 'usr-1',
  name: 'Ahmed Khan',
  email: 'ahmed.khan@stocksense.com',
  role: 'inventory-manager',
  phone: '+92 300 1234567',
  createdAt: '2024-01-15T08:00:00Z'
};

export const categories = ['Raw Materials', 'Furniture', 'Supplies', 'Electronics', 'Equipment', 'Safety'];

export const warehouses = ['Main Warehouse', 'Secondary Warehouse'];

export const statuses = ['in-stock', 'low-stock', 'out-of-stock'];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Steel Rods',
    sku: 'SR-001',
    category: 'Raw Materials',
    unitOfMeasure: 'Pieces',
    stockQuantity: 450,
    warehouse: 'Main Warehouse',
    location: 'Rack A',
    reorderLevel: 100,
    status: 'in-stock',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-05-15T14:30:00Z'
  },
  {
    id: 'prod-2',
    name: 'Office Chair',
    sku: 'OC-002',
    category: 'Furniture',
    unitOfMeasure: 'Pieces',
    stockQuantity: 25,
    warehouse: 'Main Warehouse',
    location: 'Rack B',
    reorderLevel: 10,
    status: 'in-stock',
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-06-20T11:45:00Z'
  },
  {
    id: 'prod-3',
    name: 'Wooden Table',
    sku: 'WT-003',
    category: 'Furniture',
    unitOfMeasure: 'Pieces',
    stockQuantity: 8,
    warehouse: 'Main Warehouse',
    location: 'Rack B',
    reorderLevel: 15,
    status: 'low-stock',
    createdAt: '2024-02-11T10:20:00Z',
    updatedAt: '2024-07-05T16:10:00Z'
  },
  {
    id: 'prod-4',
    name: 'Printer Paper',
    sku: 'PP-004',
    category: 'Supplies',
    unitOfMeasure: 'Reams',
    stockQuantity: 500,
    warehouse: 'Secondary Warehouse',
    location: 'Shelf A',
    reorderLevel: 100,
    status: 'in-stock',
    createdAt: '2024-03-05T13:40:00Z',
    updatedAt: '2024-06-25T09:30:00Z'
  },
  {
    id: 'prod-5',
    name: 'Laptop',
    sku: 'LP-005',
    category: 'Electronics',
    unitOfMeasure: 'Pieces',
    stockQuantity: 0,
    warehouse: 'Main Warehouse',
    location: 'Rack C',
    reorderLevel: 5,
    status: 'out-of-stock',
    createdAt: '2024-04-12T11:00:00Z',
    updatedAt: '2024-07-10T15:20:00Z'
  },
  {
    id: 'prod-6',
    name: 'LED Monitor',
    sku: 'LM-006',
    category: 'Electronics',
    unitOfMeasure: 'Pieces',
    stockQuantity: 3,
    warehouse: 'Main Warehouse',
    location: 'Rack C',
    reorderLevel: 10,
    status: 'low-stock',
    createdAt: '2024-04-15T09:45:00Z',
    updatedAt: '2024-07-12T14:15:00Z'
  },
  {
    id: 'prod-7',
    name: 'Welding Machine',
    sku: 'WM-007',
    category: 'Equipment',
    unitOfMeasure: 'Pieces',
    stockQuantity: 12,
    warehouse: 'Secondary Warehouse',
    location: 'Bay 1',
    reorderLevel: 3,
    status: 'in-stock',
    createdAt: '2024-05-02T10:30:00Z',
    updatedAt: '2024-06-18T11:20:00Z'
  },
  {
    id: 'prod-8',
    name: 'Safety Helmets',
    sku: 'SH-008',
    category: 'Safety',
    unitOfMeasure: 'Pieces',
    stockQuantity: 45,
    warehouse: 'Main Warehouse',
    location: 'Rack A',
    reorderLevel: 20,
    status: 'in-stock',
    createdAt: '2024-05-20T14:00:00Z',
    updatedAt: '2024-07-01T09:10:00Z'
  },
  {
    id: 'prod-9',
    name: 'Copper Wire',
    sku: 'CW-009',
    category: 'Raw Materials',
    unitOfMeasure: 'Meters',
    stockQuantity: 2,
    warehouse: 'Secondary Warehouse',
    location: 'Shelf B',
    reorderLevel: 50,
    status: 'low-stock',
    createdAt: '2024-06-10T11:30:00Z',
    updatedAt: '2024-07-14T16:45:00Z'
  },
  {
    id: 'prod-10',
    name: 'Hydraulic Pump',
    sku: 'HP-010',
    category: 'Equipment',
    unitOfMeasure: 'Pieces',
    stockQuantity: 0,
    warehouse: 'Secondary Warehouse',
    location: 'Bay 2',
    reorderLevel: 2,
    status: 'out-of-stock',
    createdAt: '2024-06-25T08:20:00Z',
    updatedAt: '2024-07-15T10:05:00Z'
  }
];

export const mockReceipts: Receipt[] = [
  {
    id: 'rcpt-1',
    receiptNumber: 'RCPT/2024/001',
    supplier: 'Al-Fatah Steel Corp',
    date: '2024-07-15',
    warehouse: 'Main Warehouse',
    status: 'waiting',
    products: [{ productId: 'prod-1', productName: 'Steel Rods', quantity: 200, unitOfMeasure: 'Pieces' }],
    createdAt: '2024-07-14T09:00:00Z'
  },
  {
    id: 'rcpt-2',
    receiptNumber: 'RCPT/2024/002',
    supplier: 'Tech Innovators',
    date: '2024-07-16',
    warehouse: 'Main Warehouse',
    status: 'ready',
    products: [{ productId: 'prod-5', productName: 'Laptop', quantity: 10, unitOfMeasure: 'Pieces' }],
    createdAt: '2024-07-15T10:30:00Z'
  },
  {
    id: 'rcpt-3',
    receiptNumber: 'RCPT/2024/003',
    supplier: 'Karachi Office Solutions',
    date: '2024-07-10',
    warehouse: 'Main Warehouse',
    status: 'done',
    products: [{ productId: 'prod-2', productName: 'Office Chair', quantity: 5, unitOfMeasure: 'Pieces' }],
    createdAt: '2024-07-09T14:15:00Z'
  },
  {
    id: 'rcpt-4',
    receiptNumber: 'RCPT/2024/004',
    supplier: 'Global Safety Eq',
    date: '2024-07-18',
    warehouse: 'Main Warehouse',
    status: 'draft',
    products: [{ productId: 'prod-8', productName: 'Safety Helmets', quantity: 50, unitOfMeasure: 'Pieces' }],
    createdAt: '2024-07-17T11:45:00Z'
  },
  {
    id: 'rcpt-5',
    receiptNumber: 'RCPT/2024/005',
    supplier: 'Metalworks Inc',
    date: '2024-07-12',
    warehouse: 'Secondary Warehouse',
    status: 'canceled',
    products: [{ productId: 'prod-9', productName: 'Copper Wire', quantity: 100, unitOfMeasure: 'Meters' }],
    createdAt: '2024-07-11T08:20:00Z'
  }
];

export const mockDeliveries: DeliveryOrder[] = [
  {
    id: 'del-1',
    deliveryNumber: 'OUT/2024/001',
    customer: 'Pak Construction Ltd',
    date: '2024-07-16',
    warehouse: 'Main Warehouse',
    status: 'picking',
    products: [{ productId: 'prod-1', productName: 'Steel Rods', quantity: 50, unitOfMeasure: 'Pieces' }],
    createdAt: '2024-07-15T09:10:00Z'
  },
  {
    id: 'del-2',
    deliveryNumber: 'OUT/2024/002',
    customer: 'TechHub Solutions',
    date: '2024-07-17',
    warehouse: 'Main Warehouse',
    status: 'ready',
    products: [{ productId: 'prod-6', productName: 'LED Monitor', quantity: 2, unitOfMeasure: 'Pieces' }],
    createdAt: '2024-07-16T13:40:00Z'
  },
  {
    id: 'del-3',
    deliveryNumber: 'OUT/2024/003',
    customer: 'Builders Corp',
    date: '2024-07-14',
    warehouse: 'Secondary Warehouse',
    status: 'done',
    products: [{ productId: 'prod-7', productName: 'Welding Machine', quantity: 1, unitOfMeasure: 'Pieces' }],
    createdAt: '2024-07-13T10:25:00Z'
  },
  {
    id: 'del-4',
    deliveryNumber: 'OUT/2024/004',
    customer: 'City Schools',
    date: '2024-07-18',
    warehouse: 'Secondary Warehouse',
    status: 'draft',
    products: [{ productId: 'prod-4', productName: 'Printer Paper', quantity: 20, unitOfMeasure: 'Reams' }],
    createdAt: '2024-07-17T14:50:00Z'
  },
  {
    id: 'del-5',
    deliveryNumber: 'OUT/2024/005',
    customer: 'Fast Forward Logistics',
    date: '2024-07-15',
    warehouse: 'Main Warehouse',
    status: 'canceled',
    products: [{ productId: 'prod-3', productName: 'Wooden Table', quantity: 4, unitOfMeasure: 'Pieces' }],
    createdAt: '2024-07-14T11:15:00Z'
  }
];

export const mockTransfers: InternalTransfer[] = [
  {
    id: 'trf-1',
    transferNumber: 'TRF/2024/001',
    product: 'Printer Paper',
    quantity: 50,
    sourceLocation: 'Secondary Warehouse/Shelf A',
    destinationLocation: 'Main Warehouse/Rack B',
    date: '2024-07-16',
    status: 'in-progress',
    createdAt: '2024-07-15T09:30:00Z'
  },
  {
    id: 'trf-2',
    transferNumber: 'TRF/2024/002',
    product: 'Safety Helmets',
    quantity: 10,
    sourceLocation: 'Main Warehouse/Rack A',
    destinationLocation: 'Secondary Warehouse/Bay 1',
    date: '2024-07-17',
    status: 'draft',
    createdAt: '2024-07-16T14:20:00Z'
  },
  {
    id: 'trf-3',
    transferNumber: 'TRF/2024/003',
    product: 'Steel Rods',
    quantity: 100,
    sourceLocation: 'Main Warehouse/Rack A',
    destinationLocation: 'Secondary Warehouse/Bay 2',
    date: '2024-07-10',
    status: 'done',
    createdAt: '2024-07-09T11:00:00Z'
  },
  {
    id: 'trf-4',
    transferNumber: 'TRF/2024/004',
    product: 'Welding Machine',
    quantity: 2,
    sourceLocation: 'Secondary Warehouse/Bay 1',
    destinationLocation: 'Main Warehouse/Production Rack',
    date: '2024-07-12',
    status: 'canceled',
    createdAt: '2024-07-11T16:45:00Z'
  }
];

export const mockAdjustments: InventoryAdjustment[] = [
  {
    id: 'adj-1',
    product: 'Wooden Table',
    warehouse: 'Main Warehouse',
    location: 'Rack B',
    recordedQuantity: 10,
    countedQuantity: 8,
    difference: -2,
    reason: 'damaged',
    date: '2024-07-15',
    status: 'validated',
    createdAt: '2024-07-15T10:00:00Z'
  },
  {
    id: 'adj-2',
    product: 'Copper Wire',
    warehouse: 'Secondary Warehouse',
    location: 'Shelf B',
    recordedQuantity: 5,
    countedQuantity: 2,
    difference: -3,
    reason: 'missing',
    date: '2024-07-14',
    status: 'validated',
    createdAt: '2024-07-14T09:30:00Z'
  },
  {
    id: 'adj-3',
    product: 'Office Chair',
    warehouse: 'Main Warehouse',
    location: 'Rack B',
    recordedQuantity: 24,
    countedQuantity: 25,
    difference: 1,
    reason: 'counting-error',
    date: '2024-07-16',
    status: 'draft',
    createdAt: '2024-07-16T11:15:00Z'
  },
  {
    id: 'adj-4',
    product: 'Printer Paper',
    warehouse: 'Secondary Warehouse',
    location: 'Shelf A',
    recordedQuantity: 500,
    countedQuantity: 490,
    difference: -10,
    reason: 'other',
    date: '2024-07-10',
    status: 'canceled',
    createdAt: '2024-07-10T14:20:00Z'
  }
];

export const mockWarehouses: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'Main Warehouse',
    code: 'WH-001',
    address: '123 Industrial Area, Karachi',
    locations: [
      { id: 'loc-1', name: 'Rack A', code: 'RA', stockQuantity: 495 },
      { id: 'loc-2', name: 'Rack B', code: 'RB', stockQuantity: 33 },
      { id: 'loc-3', name: 'Rack C', code: 'RC', stockQuantity: 3 },
      { id: 'loc-4', name: 'Production Rack', code: 'PR', stockQuantity: 0 }
    ],
    totalStock: 531,
    status: 'active'
  },
  {
    id: 'wh-2',
    name: 'Secondary Warehouse',
    code: 'WH-002',
    address: '45 Business Park, Lahore',
    locations: [
      { id: 'loc-5', name: 'Shelf A', code: 'SA', stockQuantity: 500 },
      { id: 'loc-6', name: 'Shelf B', code: 'SB', stockQuantity: 2 },
      { id: 'loc-7', name: 'Bay 1', code: 'B1', stockQuantity: 12 },
      { id: 'loc-8', name: 'Bay 2', code: 'B2', stockQuantity: 0 }
    ],
    totalStock: 514,
    status: 'active'
  }
];

export const mockMoveHistory: MoveHistory[] = [
  {
    id: 'mv-1',
    date: '2024-07-10T09:00:00Z',
    product: 'Steel Rods',
    operationType: 'receipt',
    source: 'Supplier',
    destination: 'Main Warehouse/Rack A',
    quantity: 200,
    reference: 'RCPT/2024/001',
    user: 'Ahmed Khan',
    status: 'completed'
  },
  {
    id: 'mv-2',
    date: '2024-07-11T10:30:00Z',
    product: 'Welding Machine',
    operationType: 'delivery',
    source: 'Secondary Warehouse/Bay 1',
    destination: 'Customer',
    quantity: 1,
    reference: 'OUT/2024/003',
    user: 'Ahmed Khan',
    status: 'completed'
  },
  {
    id: 'mv-3',
    date: '2024-07-12T11:15:00Z',
    product: 'Printer Paper',
    operationType: 'internal-transfer',
    source: 'Secondary Warehouse/Shelf A',
    destination: 'Main Warehouse/Rack B',
    quantity: 50,
    reference: 'TRF/2024/001',
    user: 'Ahmed Khan',
    status: 'pending'
  },
  {
    id: 'mv-4',
    date: '2024-07-13T14:20:00Z',
    product: 'Wooden Table',
    operationType: 'adjustment',
    source: 'Main Warehouse/Rack B',
    destination: 'Inventory Loss',
    quantity: 2,
    reference: 'ADJ/2024/001',
    user: 'Ahmed Khan',
    status: 'completed'
  },
  {
    id: 'mv-5',
    date: '2024-07-14T09:45:00Z',
    product: 'Office Chair',
    operationType: 'receipt',
    source: 'Supplier',
    destination: 'Main Warehouse/Rack B',
    quantity: 5,
    reference: 'RCPT/2024/003',
    user: 'Ahmed Khan',
    status: 'completed'
  },
  {
    id: 'mv-6',
    date: '2024-07-15T13:10:00Z',
    product: 'LED Monitor',
    operationType: 'delivery',
    source: 'Main Warehouse/Rack C',
    destination: 'Customer',
    quantity: 2,
    reference: 'OUT/2024/002',
    user: 'Ahmed Khan',
    status: 'pending'
  },
  {
    id: 'mv-7',
    date: '2024-07-16T15:30:00Z',
    product: 'Safety Helmets',
    operationType: 'internal-transfer',
    source: 'Main Warehouse/Rack A',
    destination: 'Secondary Warehouse/Bay 1',
    quantity: 10,
    reference: 'TRF/2024/002',
    user: 'Ahmed Khan',
    status: 'pending'
  },
  {
    id: 'mv-8',
    date: '2024-07-17T08:20:00Z',
    product: 'Copper Wire',
    operationType: 'adjustment',
    source: 'Secondary Warehouse/Shelf B',
    destination: 'Inventory Loss',
    quantity: 3,
    reference: 'ADJ/2024/002',
    user: 'Ahmed Khan',
    status: 'completed'
  }
];

export const mockRecentOperations: RecentOperation[] = [
  {
    id: 'op-1',
    type: 'receipt',
    reference: 'RCPT/2024/002',
    description: 'Received 10 Laptops from Tech Innovators',
    date: '2024-07-16T10:30:00Z',
    status: 'ready'
  },
  {
    id: 'op-2',
    type: 'delivery',
    reference: 'OUT/2024/001',
    description: 'Picking 50 Steel Rods for Pak Construction Ltd',
    date: '2024-07-16T09:10:00Z',
    status: 'picking'
  },
  {
    id: 'op-3',
    type: 'transfer',
    reference: 'TRF/2024/001',
    description: 'Transfer 50 Printer Paper to Main Warehouse',
    date: '2024-07-15T09:30:00Z',
    status: 'in-progress'
  },
  {
    id: 'op-4',
    type: 'adjustment',
    reference: 'ADJ-1',
    description: 'Adjusted Wooden Table (-2) - Damaged',
    date: '2024-07-15T10:00:00Z',
    status: 'validated'
  },
  {
    id: 'op-5',
    type: 'receipt',
    reference: 'RCPT/2024/003',
    description: 'Received 5 Office Chairs from Karachi Office Solutions',
    date: '2024-07-10T14:15:00Z',
    status: 'done'
  },
  {
    id: 'op-6',
    type: 'delivery',
    reference: 'OUT/2024/003',
    description: 'Delivered 1 Welding Machine to Builders Corp',
    date: '2024-07-14T10:25:00Z',
    status: 'done'
  }
];

export const mockDashboardKPIs: DashboardKPIs = {
  totalProducts: 10,
  lowStockItems: 3,
  outOfStockItems: 2,
  pendingReceipts: 2,
  pendingDeliveries: 2,
  scheduledTransfers: 2
};
