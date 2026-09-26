import React from 'react';
import {
  Package,
  AlertTriangle,
  PackageX,
  Clock,
  Truck,
  ArrowLeftRight,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import StatCard from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  mockDashboardKPIs,
  mockRecentOperations,
  mockProducts,
} from '../data/mockData';

export const Dashboard: React.FC = () => {
  const lowStockProducts = mockProducts.filter(
    (p) => p.status === 'low-stock' || p.status === 'out-of-stock'
  );

  const stockSummary = {
    inStock: mockProducts.filter((p) => p.status === 'in-stock').length,
    lowStock: mockProducts.filter((p) => p.status === 'low-stock').length,
    outOfStock: mockProducts.filter((p) => p.status === 'out-of-stock').length,
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Products"
          value={mockDashboardKPIs.totalProducts}
          icon={Package}
          trend="up"
          trendUp={true}
          iconBgColor="bg-blue-100"
        />
        <StatCard
          title="Low Stock"
          value={mockDashboardKPIs.lowStockItems}
          icon={AlertTriangle}
          trend="down"
          trendUp={false}
          iconBgColor="bg-amber-100"
        />
        <StatCard
          title="Out of Stock"
          value={mockDashboardKPIs.outOfStockItems}
          icon={PackageX}
          iconBgColor="bg-red-100"
        />
        <StatCard
          title="Pending Receipts"
          value={mockDashboardKPIs.pendingReceipts}
          icon={Clock}
          iconBgColor="bg-purple-100"
        />
        <StatCard
          title="Pending Deliveries"
          value={mockDashboardKPIs.pendingDeliveries}
          icon={Truck}
          iconBgColor="bg-indigo-100"
        />
        <StatCard
          title="Scheduled Transfers"
          value={mockDashboardKPIs.scheduledTransfers}
          icon={ArrowLeftRight}
          iconBgColor="bg-teal-100"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column (Wider) */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-500" />
                Recent Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentOperations.map((operation) => (
                  <div
                    key={operation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-slate-100">
                        {operation.type === 'receipt' ? (
                          <PackageCheck className="w-4 h-4 text-emerald-600" />
                        ) : operation.type === 'delivery' ? (
                          <Truck className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <ArrowLeftRight className="w-4 h-4 text-teal-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {operation.reference}
                        </div>
                        <div className="text-sm text-slate-500">
                          {operation.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-sm text-slate-500">
                        {operation.date}
                      </div>
                      <StatusBadge status={operation.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Narrower) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {/* Safely fallback between quantity/stock names to resolve TS definition mismatches */}
                        Stock: {(product as any).quantity ?? (product as any).stock ?? 0} / Reorder: {product.reorderLevel}
                      </div>
                    </div>
                    <StatusBadge status={product.status} />
                  </div>
                ))}
                {lowStockProducts.length === 0 && (
                  <div className="text-center py-6 text-slate-500">
                    No low stock alerts
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                Stock Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-600">In Stock</span>
                  </div>
                  <span className="font-semibold">{stockSummary.inStock}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-slate-600">Low Stock</span>
                  </div>
                  <span className="font-semibold">{stockSummary.lowStock}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-slate-600">Out of Stock</span>
                  </div>
                  <span className="font-semibold">
                    {stockSummary.outOfStock}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};