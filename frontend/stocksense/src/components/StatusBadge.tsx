import { cn } from '../lib/utils';

export type StatusType = 
  | 'draft' 
  | 'ready' 
  | 'done' 
  | 'cancelled' 
  | 'in_transit' 
  | 'pending'
  | 'active'
  | 'inactive'
  | 'low_stock'
  | 'out_of_stock';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (s: string) => {
    switch (s.toLowerCase()) {
      case 'done':
      case 'active':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-500/10',
          text: 'text-emerald-700 dark:text-emerald-400',
          border: 'border-emerald-200/50 dark:border-emerald-500/20',
          dot: 'bg-emerald-500',
          label: s,
        };
      case 'ready':
      case 'in_transit':
        return {
          bg: 'bg-blue-50 dark:bg-blue-500/10',
          text: 'text-blue-700 dark:text-blue-400',
          border: 'border-blue-200/50 dark:border-blue-500/20',
          dot: 'bg-blue-500',
          label: s.replace('_', ' '),
        };
      case 'pending':
      case 'draft':
        return {
          bg: 'bg-amber-50 dark:bg-amber-500/10',
          text: 'text-amber-700 dark:text-amber-400',
          border: 'border-amber-200/50 dark:border-amber-500/20',
          dot: 'bg-amber-500',
          label: s,
        };
      case 'cancelled':
      case 'inactive':
      case 'out_of_stock':
        return {
          bg: 'bg-rose-50 dark:bg-rose-500/10',
          text: 'text-rose-700 dark:text-rose-400',
          border: 'border-rose-200/50 dark:border-rose-500/20',
          dot: 'bg-rose-500',
          label: s.replace(/_/g, ' '),
        };
      case 'low_stock':
        return {
          bg: 'bg-orange-50 dark:bg-orange-500/10',
          text: 'text-orange-700 dark:text-orange-400',
          border: 'border-orange-200/50 dark:border-orange-500/20',
          dot: 'bg-orange-500',
          label: s.replace('_', ' '),
        };
      default:
        return {
          bg: 'bg-slate-50 dark:bg-slate-500/10',
          text: 'text-slate-700 dark:text-slate-400',
          border: 'border-slate-200/50 dark:border-slate-500/20',
          dot: 'bg-slate-500',
          label: s,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shadow-sm", config.dot)} />
      <span className="capitalize">{config.label}</span>
    </span>
  );
}
