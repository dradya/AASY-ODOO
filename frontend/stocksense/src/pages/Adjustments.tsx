import { useMemo, useState } from 'react';
import { ClipboardList, Search, Filter, ClipboardCheck, FileText, AlertCircle } from 'lucide-react';
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
import { cn } from '../lib/utils';
import { mockAdjustments } from '../data/mockData';

const reasons = ['damaged', 'missing', 'counting-error', 'other'];

const reasonLabel: Record<string, string> = {
  damaged: 'Damaged',
  missing: 'Missing',
  'counting-error': 'Counting Error',
  other: 'Other',
};

export default function Adjustments() {
  const [search, setSearch] = useState('');
  const [reasonFilter, setReasonFilter] = useState('all');

  const filtered = useMemo(() => {
    return mockAdjustments.filter((a) => {
      const matchesSearch = a.product.toLowerCase().includes(search.toLowerCase());
      const matchesReason = reasonFilter === 'all' || a.reason === reasonFilter;
      return matchesSearch && matchesReason;
    });
  }, [search, reasonFilter]);

  const netDifference = mockAdjustments
    .filter((a) => a.status !== 'canceled')
    .reduce((sum, a) => sum + a.difference, 0);

  const counts = {
    validated: mockAdjustments.filter((a) => a.status === 'validated').length,
    draft: mockAdjustments.filter((a) => a.status === 'draft').length,
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Inventory Adjustments
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage corrections between recorded and physically counted stock
          </p>
        </div>
        <Button className="gap-2 shadow-sm rounded-lg" size="lg">
          <ClipboardList className="h-4 w-4" />
          New Adjustment
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-sm group hover:bg-card/60 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <ClipboardCheck className="w-32 h-32" />
          </div>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Validated</p>
            <p className="mt-2 font-heading text-3xl font-bold text-emerald-600">{counts.validated}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-sm group hover:bg-card/60 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-400 to-slate-600" />
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <FileText className="w-32 h-32" />
          </div>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Draft</p>
            <p className="mt-2 font-heading text-3xl font-bold text-slate-600">{counts.draft}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-sm group hover:bg-card/60 transition-colors">
          <div className={cn("absolute top-0 left-0 w-full h-1 bg-gradient-to-r", netDifference < 0 ? 'from-red-400 to-red-600' : 'from-emerald-400 to-emerald-600')} />
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <AlertCircle className="w-32 h-32" />
          </div>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Difference</p>
            <p
              className={cn(
                'mt-2 font-heading text-3xl font-bold',
                netDifference < 0 ? 'text-red-600' : 'text-emerald-600'
              )}
            >
              {netDifference > 0 ? `+${netDifference}` : netDifference}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card/40 backdrop-blur-sm p-4 rounded-xl border shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search product..."
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
          <Select value={reasonFilter} onValueChange={setReasonFilter}>
            <SelectTrigger className="w-[160px] bg-background/50 rounded-lg h-10 border-muted-foreground/20">
              <SelectValue placeholder="Reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reasons</SelectItem>
              {reasons.map((r) => (
                <SelectItem key={r} value={r}>
                  {reasonLabel[r]}
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
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="text-right font-semibold">Recorded</TableHead>
                <TableHead className="text-right font-semibold">Counted</TableHead>
                <TableHead className="text-right font-semibold">Difference</TableHead>
                <TableHead className="font-semibold">Reason</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <ClipboardList className="h-8 w-8 opacity-40" />
                      <p>No adjustments found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((a) => (
                  <TableRow key={a.id} className="hover:bg-muted/40 transition-colors group cursor-pointer">
                    <TableCell className="font-medium">{a.product}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50 text-sm group-hover:bg-muted transition-colors">
                        {a.warehouse} / {a.location}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{a.recordedQuantity}</TableCell>
                    <TableCell className="text-right font-medium">{a.countedQuantity}</TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-bold',
                        a.difference < 0 ? 'text-red-600' : (a.difference > 0 ? 'text-emerald-600' : 'text-muted-foreground')
                      )}
                    >
                      {a.difference > 0 ? `+${a.difference}` : a.difference}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted">
                        {reasonLabel[a.reason]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={a.status} />
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
