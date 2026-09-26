import { useMemo, useState } from 'react';
import { ArrowLeftRight, Search, Filter, ArrowRight, Route, FileText, CheckCircle2 } from 'lucide-react';
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
import { mockTransfers } from '../data/mockData';

const statuses = ['draft', 'in-progress', 'done', 'canceled'];

export default function Transfers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return mockTransfers.filter((t) => {
      const matchesSearch =
        t.transferNumber.toLowerCase().includes(search.toLowerCase()) ||
        t.product.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const counts = {
    inProgress: mockTransfers.filter((t) => t.status === 'in-progress').length,
    draft: mockTransfers.filter((t) => t.status === 'draft').length,
    done: mockTransfers.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Internal Transfers</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage stock moves between warehouses and locations</p>
        </div>
        <Button className="gap-2 shadow-sm rounded-lg" size="lg">
          <ArrowLeftRight className="h-4 w-4" />
          New Transfer
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm relative overflow-hidden bg-card/40 backdrop-blur-sm group hover:bg-card/60 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Route className="w-32 h-32" />
          </div>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In Progress</p>
            <p className="mt-2 font-heading text-3xl font-bold text-amber-600">{counts.inProgress}</p>
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
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <CheckCircle2 className="w-32 h-32" />
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
            placeholder="Search transfer no., product..."
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-background/50 rounded-lg h-10 border-muted-foreground/20">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
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
                <TableHead className="font-semibold">Transfer No.</TableHead>
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="text-right font-semibold">Qty</TableHead>
                <TableHead className="font-semibold">Route</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <ArrowLeftRight className="h-8 w-8 opacity-40" />
                      <p>No transfers found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/40 transition-colors group cursor-pointer">
                    <TableCell className="font-medium">{t.transferNumber}</TableCell>
                    <TableCell>{t.product}</TableCell>
                    <TableCell className="text-right font-medium">{t.quantity}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md group-hover:bg-muted transition-colors">
                        <span className="truncate max-w-[100px]" title={t.sourceLocation}>{t.sourceLocation}</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-foreground/50" />
                        <span className="truncate max-w-[100px]" title={t.destinationLocation}>{t.destinationLocation}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={t.status} />
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
