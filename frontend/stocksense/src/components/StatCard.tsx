import { cn } from '../lib/utils';
import { Card, CardContent } from './ui/card';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-background/60 backdrop-blur-sm border-border/50", className)}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold tracking-tight font-heading text-foreground">
                {value}
              </h2>
            </div>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shadow-inner">
            <Icon className="h-7 w-7" />
          </div>
        </div>
        
        {(trend || description) && (
          <div className="mt-4 flex items-center text-sm">
            {trend && (
              <span
                className={cn(
                  "flex items-center font-medium px-2 py-0.5 rounded-full",
                  trend.isPositive ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400" : "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400"
                )}
              >
                {trend.isPositive ? (
                  <ArrowUpIcon className="mr-1 h-3.5 w-3.5" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3.5 w-3.5" />
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <span className="ml-2 text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
