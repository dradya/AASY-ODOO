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

export const Dashboard = () => {
  const lowStockProducts = mockProducts.filter(
    (p) => p.status === 'low-stock' || p.status === 'out-of-stock'
  );

  const stockSummary = {
    inStock: mockProducts.filter((p) => p.status === 'in-stock').length,
    lowStock: mockProducts.filter((p) => p.status === 'low-stock').length,
    outOfStock: mockProducts.filter((p) => p.status === 'out-of-stock').length,
  };

  const totalStock = stockSummary.inStock + stockSummary.lowStock + stockSummary.outOfStock;
  const pct = (n: number) => (totalStock === 0 ? 0 : Math.round((n / totalStock) * 100));

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A snapshot of stock levels and warehouse activity across your sites.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Products"
          value={mockDashboardKPIs.totalProducts}
          icon={Package}
          trend="up"
          trendValue="4.2%"
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
          accentClassName="bg-primary"
        />
        <StatCard
          title="Low Stock"
          value={mockDashboardKPIs.lowStockItems}
          icon={AlertTriangle}
          trend="down"
          trendValue="1.1%"
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
          accentClassName="bg-amber-500"
        />
        <StatCard
          title="Out of Stock"
          value={mockDashboardKPIs.outOfStockItems}
          icon={PackageX}
          trend="neutral"
          trendValue="No change"
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
          accentClassName="bg-red-500"
        />
        <StatCard
          title="Pending Receipts"
          value={mockDashboardKPIs.pendingReceipts}
          icon={Clock}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          accentClassName="bg-purple-500"
        />
        <StatCard
          title="Pending Deliveries"
          value={mockDashboardKPIs.pendingDeliveries}
          icon={Truck}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
          accentClassName="bg-indigo-500"
        />
        <StatCard
          title="Scheduled Transfers"
          value={mockDashboardKPIs.scheduledTransfers}
          icon={ArrowLeftRight}
          iconColor="text-teal-600"
          iconBgColor="bg-teal-100"
          accentClassName="bg-teal-500"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column (Wider) */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-4.5 h-4.5 text-muted-foreground" />
                Recent Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockRecentOperations.map((operation) => (
                  <div
                    key={operation.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 p-3.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        {operation.type === 'receipt' ? (
                          <PackageCheck className="w-4 h-4 text-emerald-600" />
                        ) : operation.type === 'delivery' ? (
                          <Truck className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <ArrowLeftRight className="w-4 h-4 text-teal-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-foreground truncate">
                          {operation.reference}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {operation.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(operation.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
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
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="w-4.5 h-4.5 text-amber-500" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Stock: {product.stockQuantity} / Reorder: {product.reorderLevel}
                      </div>
                    </div>
                    <StatusBadge status={product.status} />
                  </div>
                ))}
                {lowStockProducts.length === 0 && (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No low stock alerts
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="w-4.5 h-4.5 text-primary" />
                Stock Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="bg-emerald-500" style={{ width: `${pct(stockSummary.inStock)}%` }} />
                  <div className="bg-amber-500" style={{ width: `${pct(stockSummary.lowStock)}%` }} />
                  <div className="bg-red-500" style={{ width: `${pct(stockSummary.outOfStock)}%` }} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">In Stock</span>
                    </div>
                    <span className="font-semibold text-foreground">{stockSummary.inStock}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-muted-foreground">Low Stock</span>
                    </div>
                    <span className="font-semibold text-foreground">{stockSummary.lowStock}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="text-muted-foreground">Out of Stock</span>
                    </div>
                    <span className="font-semibold text-foreground">
                      {stockSummary.outOfStock}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
