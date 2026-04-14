import { useMemo, useState } from 'react';
import { recentInvoices as defaultInvoices } from '@/hq/data/mockData';
import StatusBadge from './StatusBadge';
import { InvoiceStatus, RecentInvoice } from '@/hq/types';

type RunStatusFilter = 'all' | Extract<InvoiceStatus, 'Matched' | 'Open'>;

export default function RecentInvoicesFeed({ data }: { data?: RecentInvoice[] }) {
  const recentInvoices = data ?? defaultInvoices;
  const [statusFilter, setStatusFilter] = useState<RunStatusFilter>('all');
  const filterOptions = useMemo(
    () => [
      { value: 'all' as const, label: 'All' },
      ...Array.from(new Set(recentInvoices.map((invoice) => invoice.status)))
        .filter((status): status is Extract<InvoiceStatus, 'Matched' | 'Open'> => status === 'Matched' || status === 'Open')
        .map((status) => ({ value: status, label: status })),
    ],
    [recentInvoices]
  );

  const filteredInvoices = useMemo(
    () => statusFilter === 'all' ? recentInvoices : recentInvoices.filter((inv) => inv.status === statusFilter),
    [recentInvoices, statusFilter]
  );

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col overflow-hidden h-full p-4">
      <div className="pb-2 border-b border-border flex-shrink-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Recent Reconciliations</h3>
          <div className="inline-flex w-fit rounded-lg border border-border bg-muted/40 p-1">
            {filterOptions.map((option) => {
              const active = statusFilter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.value)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[24%_34%_18%_24%] w-full py-2 border-b border-border flex-shrink-0">
        <span className="min-w-0 pr-3 text-xs font-semibold text-foreground/80 uppercase tracking-wide">Time</span>
        <span className="min-w-0 px-3 text-xs font-semibold text-foreground/80 uppercase tracking-wide text-left">Account</span>
        <span className="min-w-0 px-3 text-xs font-semibold text-foreground/80 uppercase tracking-wide text-left">Value</span>
        <span className="min-w-0 pl-3 text-xs font-semibold text-foreground/80 uppercase tracking-wide text-right">Status</span>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((inv) => (
            <div key={inv.id} className="grid grid-cols-[24%_34%_18%_24%] w-full items-center py-2 hover:bg-muted transition-colors">
              <span className="min-w-0 pr-3 text-xs text-foreground/60">{inv.timestamp}</span>
              <span className="min-w-0 px-3 text-xs text-foreground/80 text-left">{inv.accountName ?? inv.subjectReference ?? '—'}</span>
              <span className="min-w-0 px-3 text-xs text-foreground/80 text-left">{inv.value ?? '—'}</span>
              <div className="min-w-0 flex justify-end pl-3">
                <StatusBadge status={inv.status} />
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No recent runs for this status.
          </div>
        )}
      </div>
    </div>
  );
}
