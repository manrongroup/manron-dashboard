import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = 'default'
}) => {
  const variantStyles = {
    default: 'bg-gradient-to-br from-card to-muted/50',
    primary: 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20',
    success: 'bg-gradient-to-br from-success/10 to-success/5 border-success/20',
    warning: 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20',
    destructive: 'bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20',
  };

  const iconStyles = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  return (
    <Card className={cn(
      'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
      variantStyles[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn('h-5 w-5', iconStyles[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            {trend && (
              <span className={cn(
                'flex items-center gap-1 font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}>
                {trend.isPositive ? '↗' : '↘'}
                {Math.abs(trend.value)}%
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;