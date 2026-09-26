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
import StatusBadge from '../components/StatusBadge';
import {
  mockDashboardKPIs,
  mockRecentOperations,
  mockProducts,
  mockUser,
} from '../data/mockData';
import { cn } from '../lib/utils';

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

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const firstName = mockUser?.name?.split(' ')[0] || 'User';

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>{today}</span>
            <span className="hidden sm:inline-block text-border">•</span>
            <span className="hidden sm:inline-block">Here's what's happening in your warehouses today.</span>
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150 ease-out fill-mode-both">
        <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-xl">
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
        </div>
        <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-xl">
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
        </div>
        <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-xl">
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
        </div>
        <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-xl">
          <StatCard
            title="Pending Receipts"
            value={mockDashboardKPIs.pendingReceipts}
            icon={Clock}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            accentClassName="bg-purple-500"
          />
        </div>
        <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-xl">
          <StatCard
            title="Pending Deliveries"
            value={mockDashboardKPIs.pendingDeliveries}
            icon={Truck}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-100"
            accentClassName="bg-indigo-500"
          />
        </div>
        <div className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-xl">
          <StatCard
            title="Scheduled Transfers"
            value={mockDashboardKPIs.scheduledTransfers}
            icon={ArrowLeftRight}
            iconColor="text-teal-600"
            iconBgColor="bg-teal-100"
            accentClassName="bg-teal-500"
          />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 xl:gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 ease-out fill-mode-both">
        {/* Left Column (Wider) */}
        <div className="lg:col-span-3 space-y-6 xl:space-y-8">
          <Card className="border-border/40 shadow-sm bg-background/60 backdrop-blur-xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2.5 text-lg font-semibold">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  Recent Operations
                </CardTitle>
                <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  View All
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {mockRecentOperations.length > 0 ? (
                  mockRecentOperations.map((operation) => (
                    <div
                      key={operation.id}
                      className="group flex items-center justify-between p-4 sm:p-5 transition-all hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background shadow-sm border border-border/50 group-hover:scale-105 transition-transform duration-300">
                          {operation.type === 'receipt' ? (
                            <PackageCheck className="w-4.5 h-4.5 text-emerald-500" />
                          ) : operation.type === 'delivery' ? (
                            <Truck className="w-4.5 h-4.5 text-indigo-500" />
                          ) : (
                            <ArrowLeftRight className="w-4.5 h-4.5 text-teal-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm sm:text-base text-foreground truncate group-hover:text-primary transition-colors">
                            {operation.reference}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                            {operation.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0 pl-3">
                        <StatusBadge status={operation.status} />
                        <div className="text-[11px] sm:text-xs font-medium text-muted-foreground/70 uppercase tracking-wider whitespace-nowrap">
                          {new Date(operation.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Clock className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No recent operations</p>
                    <p className="text-xs text-muted-foreground mt-1">Your warehouse activity will appear here.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Narrower) */}
        <div className="lg:col-span-2 space-y-6 xl:space-y-8">
          <Card className="border-border/40 shadow-sm bg-background/60 backdrop-blur-xl">
            <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
              <CardTitle className="flex items-center gap-2.5 text-lg font-semibold">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((product) => {
                    const isCritical = product.status === 'out-of-stock';
                    return (
                      <div
                        key={product.id}
                        className={cn(
                          "relative flex items-center justify-between rounded-xl border p-4 transition-colors overflow-hidden",
                          isCritical 
                            ? "bg-red-500/5 border-red-500/20 hover:bg-red-500/10" 
                            : "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative flex h-2 w-2 shrink-0">
                            <span className={cn(
                              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                              isCritical ? "bg-red-500" : "bg-amber-500"
                            )}></span>
                            <span className={cn(
                              "relative inline-flex rounded-full h-2 w-2",
                              isCritical ? "bg-red-500" : "bg-amber-500"
                            )}></span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-foreground truncate">
                              {product.name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                              <span className={cn(isCritical ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400")}>
                                {product.stockQuantity} in stock
                              </span>
                              <span className="mx-1.5 opacity-50">•</span>
                              Reorder at {product.reorderLevel}
                            </div>
                          </div>
                        </div>
                        <StatusBadge status={product.status} />
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-xl border border-dashed border-border">
                    <PackageCheck className="h-8 w-8 text-emerald-500/50 mb-2" />
                    <p className="text-sm font-medium text-foreground">Stock levels are healthy</p>
                    <p className="text-xs text-muted-foreground mt-1">No critical alerts right now.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-sm bg-background/60 backdrop-blur-xl">
            <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
              <CardTitle className="flex items-center gap-2.5 text-lg font-semibold">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                Stock Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted shadow-inner">
                    <div 
                      className="bg-emerald-500 transition-all duration-1000 ease-out" 
                      style={{ width: `${pct(stockSummary.inStock)}%` }} 
                    />
                    <div 
                      className="bg-amber-500 transition-all duration-1000 ease-out delay-150" 
                      style={{ width: `${pct(stockSummary.lowStock)}%` }} 
                    />
                    <div 
                      className="bg-red-500 transition-all duration-1000 ease-out delay-300" 
                      style={{ width: `${pct(stockSummary.outOfStock)}%` }} 
                    />
                  </div>
                  <div className="absolute -top-6 right-0 text-xs font-semibold text-muted-foreground">
                    {totalStock} Total Items
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">In Stock</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-foreground">{stockSummary.inStock}</span>
                      <span className="text-xs font-medium text-emerald-600">{pct(stockSummary.inStock)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col rounded-xl bg-amber-500/5 border border-amber-500/10 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Low Stock</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-foreground">{stockSummary.lowStock}</span>
                      <span className="text-xs font-medium text-amber-600">{pct(stockSummary.lowStock)}%</span>
                    </div>
                  </div>

                  <div className="flex flex-col rounded-xl bg-red-500/5 border border-red-500/10 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Out</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-foreground">{stockSummary.outOfStock}</span>
                      <span className="text-xs font-medium text-red-600">{pct(stockSummary.outOfStock)}%</span>
                    </div>
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
