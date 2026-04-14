import { ReactNode, ElementType } from 'react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: string | number;
  valueSuffix?: string;
  subtext?: string;
  extra?: ReactNode;
  icon?: ElementType;
  iconColor?: string;
  compact?: boolean;
}

/** Displays a single KPI metric card with label, value, and optional accent bar */
export default function KPICard({ label, value, valueSuffix, subtext, extra, icon: Icon, iconColor, compact = false }: KPICardProps) {
  if (compact) {
    return (
      <div className={cn(
        'overflow-hidden rounded-lg border border-sidebar-border bg-[hsl(var(--sidebar-background))]',
        'flex flex-col px-3 pt-3 pb-3.5 gap-1.5'
      )} style={{ boxShadow: 'var(--kpi-shadow)' }}>
        {/* Top row: icon + label */}
        <div className="flex items-center gap-1.5 min-w-0">
          {Icon && (
            <Icon className={cn('flex-shrink-0', iconColor ?? 'text-foreground/80')} style={{ height: '18px', width: 'auto' }} />
          )}
          <span className="text-xs font-semibold text-foreground/80 uppercase leading-snug">{label}</span>
        </div>
        {/* Value row */}
        <div className="flex items-baseline gap-1">
          <span className="text-[26px] font-bold text-foreground leading-none tracking-tighter">{value}</span>
          {valueSuffix && <span className="text-sm font-medium text-foreground/80">{valueSuffix}</span>}
        </div>
        {subtext && <div className="text-[12px] text-foreground/80 leading-snug">{subtext}</div>}
      </div>
    );
  }

  return (
    <div className={cn(
      'overflow-hidden rounded-xl border border-sidebar-border bg-[hsl(var(--sidebar-background))]',
      'flex flex-col justify-between px-5 pt-5 pb-5 min-h-[130px]'
    )} style={{ boxShadow: 'var(--kpi-shadow)' }}>
      {/* Top row: icon + label */}
      <div className="flex items-center gap-2 min-w-0">
        {Icon && (
          <Icon className={cn('flex-shrink-0', iconColor ?? 'text-foreground/80')} style={{ height: '20px', width: 'auto' }} />
        )}
        <span className="text-sm font-semibold text-foreground/80 uppercase leading-snug">{label}</span>
      </div>
      {/* Bottom: large value + optional suffix */}
      <div className="flex items-baseline gap-1.5 mt-2">
        <div className="text-[30px] font-bold text-foreground leading-none tracking-tighter">{value}</div>
        {valueSuffix && <span className="text-sm font-medium text-foreground/80">{valueSuffix}</span>}
        {extra && <div>{extra}</div>}
      </div>
      {subtext && (
        <div className="text-[12px] text-foreground/80 leading-snug mt-0.5">{subtext}</div>
      )}
    </div>
  );
}
