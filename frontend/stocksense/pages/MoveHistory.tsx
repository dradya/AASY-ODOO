import { useMemo, useState } from 'react';
import { History, Search, Filter, PackageCheck, Truck, ArrowLeftRight, ClipboardList, ArrowRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { StatusBadge } from '../components/StatusBadge';
import { mockMoveHistory } from '../data/mockData';

const operationTypes = ['receipt', 'delivery', 'internal-transfer', 'adjustment'];

const typeMeta: Record<string, { label: string; icon: typeof PackageCheck; color: string }> = {
  receipt: { label: 'Receipt', icon: PackageCheck, color: 'text-emerald-600 bg-emerald-100' },
  delivery: { label: 'Delivery', icon: Truck, color: 'text-indigo-600 bg-indigo-100' },
  'internal-transfer': { label: 'Transfer', icon: ArrowLeftRight, color: 'text-teal-600 bg-teal-100' },
  adjustment: { label: 'Adjustment', icon: ClipboardList, color: 'text-amber-600 bg-amber-100' },
};

export default function MoveHistory() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    return mockMoveHistory.filter((m) => {
      const matchesSearch =
        m.product.toLowerCase().includes(search.toLowerCase()) ||
        m.reference.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || m.operationType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [search, typeFilter]);

  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col h-full space-y-6 animate-in">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          Move History
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          A complete audit trail of every stock movement, in one timeline
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search product, reference..."
            className="pl-9 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Operation Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {operationTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {typeMeta[t].label}
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
              <TableHead>Type</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No moves found.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((m) => {
                const meta = typeMeta[m.operationType];
                const Icon = meta.icon;
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.color}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{m.reference}</TableCell>
                    <TableCell>{m.product}</TableCell>
                    <TableCell className="text-right font-medium">{m.quantity}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        {m.source}
                        <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                        {m.destination}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{m.user}</TableCell>
                    <TableCell>
                      <StatusBadge status={m.status} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
