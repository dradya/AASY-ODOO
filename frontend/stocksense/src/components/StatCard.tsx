import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { cn } from 'cn';

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
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
}: StatCardProps) {
  return (
    <Card className="shadow-sm border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</h3>
          </div>
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', iconBgColor)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>
        
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            {trend === 'up' && (
              <>
                <TrendingUp className="mr-1 h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">{trendValue}</span>
              </>
            )}
            {trend === 'down' && (
              <>
                <TrendingDown className="mr-1 h-4 w-4 text-red-600" />
                <span className="font-medium text-red-600">{trendValue}</span>
              </>
            )}
            {trend === 'neutral' && (
              <>
                <Minus className="mr-1 h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-500">{trendValue}</span>
              </>
            )}
            <span className="ml-2 text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
