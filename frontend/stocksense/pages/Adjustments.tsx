import { useMemo, useState } from 'react';
import { ClipboardList, Search, Filter } from 'lucide-react';
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
    <div className="flex flex-col h-full space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Inventory Adjustments
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Corrections between recorded and physically counted stock
          </p>
        </div>
        <Button className="gap-2">
          <ClipboardList className="h-4 w-4" />
          New Adjustment
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Validated</p>
            <p className="mt-1 font-heading text-2xl font-bold text-emerald-600">{counts.validated}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Draft</p>
            <p className="mt-1 font-heading text-2xl font-bold text-slate-600">{counts.draft}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Difference</p>
            <p
              className={cn(
                'mt-1 font-heading text-2xl font-bold',
                netDifference < 0 ? 'text-red-600' : 'text-emerald-600'
              )}
            >
              {netDifference > 0 ? `+${netDifference}` : netDifference}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search product..."
            className="pl-9 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select value={reasonFilter} onValueChange={setReasonFilter}>
            <SelectTrigger className="w-[160px]">
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

      <div className="border rounded-lg bg-card shadow-sm overflow-x-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Recorded</TableHead>
              <TableHead className="text-right">Counted</TableHead>
              <TableHead className="text-right">Difference</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No adjustments found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.product}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {a.warehouse} / {a.location}
                  </TableCell>
                  <TableCell className="text-right">{a.recordedQuantity}</TableCell>
                  <TableCell className="text-right">{a.countedQuantity}</TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-semibold',
                      a.difference < 0 ? 'text-red-600' : 'text-emerald-600'
                    )}
                  >
                    {a.difference > 0 ? `+${a.difference}` : a.difference}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{reasonLabel[a.reason]}</TableCell>
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
  );
}
