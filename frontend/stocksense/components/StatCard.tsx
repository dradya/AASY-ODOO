import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  iconColor?: string;
  iconBgColor?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
}: StatCardProps) {
  return (
    <Card className="border-border/60 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">
              {title}
            </p>
            <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
              {value}
            </h3>
          </div>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              iconBgColor
            )}
          >
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>

        {trend && trendValue && (
          <div className="mt-3 flex items-center text-xs">
            {trend === 'up' && (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />
                {trendValue}
              </span>
            )}
            {trend === 'down' && (
              <span className="inline-flex items-center gap-1 font-medium text-red-600 dark:text-red-400">
                <TrendingDown className="h-3.5 w-3.5" />
                {trendValue}
              </span>
            )}
            {trend === 'neutral' && (
              <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
                <Minus className="h-3.5 w-3.5" />
                {trendValue}
              </span>
            )}
            <span className="ml-1.5 text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
