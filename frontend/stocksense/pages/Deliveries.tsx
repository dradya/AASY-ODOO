import { useMemo, useState } from 'react';
import { Truck, Search, Filter, Building2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { StatusBadge } from '../components/StatusBadge';
import { mockDeliveries, warehouses } from '../data/mockData';

const statuses = ['draft', 'picking', 'packing', 'ready', 'done', 'canceled'];

export default function Deliveries() {
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return mockDeliveries.filter((d) => {
      const matchesSearch =
        d.deliveryNumber.toLowerCase().includes(search.toLowerCase()) ||
        d.customer.toLowerCase().includes(search.toLowerCase());
      const matchesWarehouse = warehouseFilter === 'all' || d.warehouse === warehouseFilter;
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchesSearch && matchesWarehouse && matchesStatus;
    });
  }, [search, warehouseFilter, statusFilter]);

  const counts = {
    picking: mockDeliveries.filter((d) => d.status === 'picking' || d.status === 'packing').length,
    ready: mockDeliveries.filter((d) => d.status === 'ready').length,
    done: mockDeliveries.filter((d) => d.status === 'done').length,
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Delivery Orders</h1>
          <p className="text-muted-foreground mt-1 text-sm">Outgoing stock to customers</p>
        </div>
        <Button className="gap-2">
          <Truck className="h-4 w-4" />
          New Delivery
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In Progress</p>
            <p className="mt-1 font-heading text-2xl font-bold text-amber-600">{counts.picking}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ready</p>
            <p className="mt-1 font-heading text-2xl font-bold text-blue-600">{counts.ready}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Done</p>
            <p className="mt-1 font-heading text-2xl font-bold text-emerald-600">{counts.done}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search delivery no., customer..."
            className="pl-9 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Warehouse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg bg-card shadow-sm overflow-x-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Delivery No.</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No delivery orders found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.deliveryNumber}</TableCell>
                  <TableCell>{d.customer}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      {d.warehouse}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {d.products.map((p) => `${p.productName} (${p.quantity})`).join(', ')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={d.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
