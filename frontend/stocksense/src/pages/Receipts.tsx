import { useMemo, useState } from 'react';
import { PackagePlus, Search, Filter, Building2, PackageSearch } from 'lucide-react';
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
import StatusBadge from '../components/StatusBadge';
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
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Receipts</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage incoming stock from suppliers</p>
        </div>
        <Button className="gap-2 shadow-sm rounded-lg" size="lg">
          <PackagePlus className="h-4 w-4" />
          New Receipt
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-sm group hover:bg-card/60 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <PackagePlus className="w-32 h-32" />
          </div>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Waiting</p>
            <p className="mt-2 font-heading text-3xl font-bold text-amber-600">{counts.waiting}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-sm group hover:bg-card/60 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <PackageSearch className="w-32 h-32" />
          </div>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ready</p>
            <p className="mt-2 font-heading text-3xl font-bold text-blue-600">{counts.ready}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-sm group hover:bg-card/60 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Building2 className="w-32 h-32" />
          </div>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Done</p>
            <p className="mt-2 font-heading text-3xl font-bold text-emerald-600">{counts.done}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card/40 backdrop-blur-sm p-4 rounded-xl border shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search receipt no., supplier..."
            className="pl-10 w-full bg-background/50 border-muted-foreground/20 rounded-lg h-10 transition-colors focus-visible:bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto sm:ml-auto">
          <div className="flex items-center gap-2 text-sm text-muted-foreground hidden sm:flex">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </div>
          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger className="w-[160px] bg-background/50 rounded-lg h-10 border-muted-foreground/20">
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
            <SelectTrigger className="w-[140px] bg-background/50 rounded-lg h-10 border-muted-foreground/20">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Receipt No.</TableHead>
                <TableHead className="font-semibold">Supplier</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Warehouse</TableHead>
                <TableHead className="font-semibold">Products</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <PackageSearch className="h-8 w-8 opacity-40" />
                      <p>No receipts found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/40 transition-colors group cursor-pointer">
                    <TableCell className="font-medium">{r.receiptNumber}</TableCell>
                    <TableCell>{r.supplier}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
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
    </div>
  );
}
