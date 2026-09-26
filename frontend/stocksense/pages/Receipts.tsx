import { useMemo, useState } from 'react';
import { PackagePlus, Search, Filter, Building2 } from 'lucide-react';
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
import { mockReceipts, warehouses } from '../data/mockData';

const statuses = ['draft', 'waiting', 'ready', 'done', 'canceled'];

export default function Receipts() {
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return mockReceipts.filter((r) => {
      const matchesSearch =
        r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
        r.supplier.toLowerCase().includes(search.toLowerCase());
      const matchesWarehouse = warehouseFilter === 'all' || r.warehouse === warehouseFilter;
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesWarehouse && matchesStatus;
    });
  }, [search, warehouseFilter, statusFilter]);

  const counts = {
    waiting: mockReceipts.filter((r) => r.status === 'waiting').length,
    ready: mockReceipts.filter((r) => r.status === 'ready').length,
    done: mockReceipts.filter((r) => r.status === 'done').length,
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Receipts</h1>
          <p className="text-muted-foreground mt-1 text-sm">Incoming stock from suppliers</p>
        </div>
        <Button className="gap-2">
          <PackagePlus className="h-4 w-4" />
          New Receipt
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Waiting</p>
            <p className="mt-1 font-heading text-2xl font-bold text-amber-600">{counts.waiting}</p>
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
            placeholder="Search receipt no., supplier..."
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
              <TableHead>Receipt No.</TableHead>
              <TableHead>Supplier</TableHead>
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
                  No receipts found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.receiptNumber}</TableCell>
                  <TableCell>{r.supplier}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      {r.warehouse}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.products.map((p) => `${p.productName} (${p.quantity})`).join(', ')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
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
