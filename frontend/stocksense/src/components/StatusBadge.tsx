import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from 'cn';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalizedStatus = status.toLowerCase();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
      case 'done':
      case 'completed':
      case 'validated':
      case 'active':
        return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80';
      case 'low-stock':
      case 'waiting':
      case 'picking':
      case 'packing':
      case 'in-progress':
      case 'pending':
      case 'draft':
        return 'bg-amber-100 text-amber-700 hover:bg-amber-100/80';
      case 'out-of-stock':
      case 'canceled':
      case 'inactive':
        return 'bg-red-100 text-red-700 hover:bg-red-100/80';
      case 'ready':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100/80';
      default:
        return 'bg-slate-100 text-slate-700 hover:bg-slate-100/80';
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Badge
      variant="outline"
      className={cn('font-medium border-0', getStatusColor(normalizedStatus))}
    >
      {formatStatus(status)}
    </Badge>
  );
};
