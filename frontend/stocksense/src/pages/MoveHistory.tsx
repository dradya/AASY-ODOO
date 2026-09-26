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
import StatusBadge from '../components/StatusBadge';
import { Badge } from '../components/ui/badge';
import { mockMoveHistory } from '../data/mockData';

const operationTypes = ['receipt', 'delivery', 'internal-transfer', 'adjustment'];

const typeMeta: Record<string, { label: string; icon: typeof PackageCheck; color: string; border: string }> = {
  receipt: { label: 'Receipt', icon: PackageCheck, color: 'text-emerald-700 bg-emerald-100/80 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-800/50', border: 'border-l-emerald-500' },
  delivery: { label: 'Delivery', icon: Truck, color: 'text-indigo-700 bg-indigo-100/80 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/50 dark:border-indigo-800/50', border: 'border-l-indigo-500' },
  'internal-transfer': { label: 'Transfer', icon: ArrowLeftRight, color: 'text-teal-700 bg-teal-100/80 border-teal-200 dark:text-teal-400 dark:bg-teal-950/50 dark:border-teal-800/50', border: 'border-l-teal-500' },
  adjustment: { label: 'Adjustment', icon: ClipboardList, color: 'text-amber-700 bg-amber-100/80 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-800/50', border: 'border-l-amber-500' },
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
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <History className="h-6 w-6" />
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              Move History
            </h1>
            <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full font-medium ml-2">
              {sorted.length} Records
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            A complete audit trail of every stock movement, arranged in a chronological timeline
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card/60 backdrop-blur-xl p-5 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:max-w-md transition-all group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
          <Input
            placeholder="Search by product name or reference..."
            className="pl-10 w-full rounded-xl bg-background/50 border-border/50 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto sm:ml-auto">
          <div className="hidden sm:flex items-center justify-center bg-muted/50 p-2 rounded-lg border border-border/50">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] rounded-xl bg-background/50 border-border/50 focus:ring-indigo-500/30">
              <SelectValue placeholder="Operation Type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Operations</SelectItem>
              {operationTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  <div className="flex items-center gap-2">
                    {typeMeta[t].label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border border-border/50 rounded-2xl bg-card shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b-border/50">
                <TableHead className="w-[180px] py-4 pl-6">Operation Type</TableHead>
                <TableHead className="py-4">Reference</TableHead>
                <TableHead className="py-4">Product</TableHead>
                <TableHead className="text-right py-4">Quantity</TableHead>
                <TableHead className="py-4">Route</TableHead>
                <TableHead className="py-4">Date</TableHead>
                <TableHead className="py-4">User</TableHead>
                <TableHead className="py-4 pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="relative">
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <History className="h-8 w-8 opacity-20" />
                      <p>No stock movements found matching your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((m, index) => {
                  const meta = typeMeta[m.operationType];
                  const Icon = meta.icon;
                  // Connecting line logic for timeline effect
                  const isLast = index === sorted.length - 1;
                  
                  return (
                    <TableRow key={m.id} className="hover:bg-muted/40 transition-colors group border-b-border/30 relative">
                      {/* Timeline subtle accent border */}
                      <TableCell className="pl-0 py-3 relative">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${meta.border} opacity-70`}></div>
                        <div className="pl-6 flex items-center h-full">
                          <span
                            className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold border ${meta.color} shadow-sm`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {meta.label}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground tracking-tight">{m.reference}</TableCell>
                      <TableCell className="font-medium text-muted-foreground">{m.product}</TableCell>
                      <TableCell className="text-right font-bold font-heading text-foreground text-base bg-muted/10">{m.quantity}</TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-lg border border-border/40 text-sm font-medium text-muted-foreground">
                          <span className="truncate max-w-[100px]" title={m.source}>{m.source}</span>
                          <div className="bg-background p-1 rounded-full shadow-sm border border-border/50">
                            <ArrowRight className="h-3 w-3 text-indigo-400 shrink-0" />
                          </div>
                          <span className="truncate max-w-[100px]" title={m.destination}>{m.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        <div className="flex flex-col">
                          <span className="text-foreground">
                            {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-xs text-muted-foreground opacity-70">
                            {new Date(m.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                            {m.user.charAt(0)}
                          </div>
                          <span className="text-sm text-muted-foreground font-medium">{m.user}</span>
                        </div>
                      </TableCell>
                      <TableCell className="pr-6">
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
    </div>
  );
}
