import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  loading?: boolean;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  subtitle?: string;
  progress?: {
    value: number;
    max?: number;
    label?: string;
  };
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  onClick?: () => void;
  clickable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  loading,
  variant = 'default',
  subtitle,
  progress,
  badge,
  onClick,
  clickable = false,
  size = 'md'
}) => {
  const variantStyles = {
    default: 'bg-gradient-to-br from-card to-muted/50 border-border/50',
    primary: 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20',
    success: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950/20 dark:to-green-900/10 dark:border-green-800/30',
    warning: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-950/20 dark:to-yellow-900/10 dark:border-yellow-800/30',
    destructive: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-950/20 dark:to-red-900/10 dark:border-red-800/30',
    info: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950/20 dark:to-blue-900/10 dark:border-blue-800/30',
  };

  const iconStyles = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    destructive: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  const sizeStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value === 0) return <Minus className="h-3 w-3" />;
    return trend.isPositive ?
      <TrendingUp className="h-3 w-3" /> :
      <TrendingDown className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground';
    if (trend.value === 0) return 'text-muted-foreground';
    return trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  return (
    <Card
      className={cn(
        'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group',
        variantStyles[variant],
        (clickable || onClick) && 'cursor-pointer hover:shadow-xl',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className={cn('flex flex-row items-center justify-between space-y-0 pb-2', sizeStyles[size])}>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {badge && (
            <Badge variant={badge.variant || 'secondary'} className="w-fit text-xs">
              {badge.text}
            </Badge>
          )}
        </div>
        <div className="relative">
          <Icon className={cn('h-5 w-5 transition-colors', iconStyles[variant])} />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn('pt-0', sizeStyles[size])}>
        <div className="space-y-3">
          <div className="text-2xl font-bold tracking-tight">{value}</div>

          {subtitle && (
            <div className="text-sm text-muted-foreground">{subtitle}</div>
          )}

          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress.label || 'Progress'}</span>
                <span>{progress.value}%</span>
              </div>
              <Progress
                value={progress.value}
                max={progress.max || 100}
                className="h-2"
              />
            </div>
          )}

          {(description || trend) && (
            <div className="flex items-center justify-between text-xs">
              {description && (
                <span className="text-muted-foreground">{description}</span>
              )}
              {trend && (
                <div className={cn(
                  'flex items-center gap-1 font-medium',
                  getTrendColor()
                )}>
                  {getTrendIcon()}
                  <span>{Math.abs(trend.value)}%</span>
                  {trend.period && (
                    <span className="text-muted-foreground">({trend.period})</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;