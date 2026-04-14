import { Badge } from '@/components/ui/badge';
import { ReviewStatus, InvoiceStatus } from '@/hq/types';
import { useHQTheme } from '@/hq/context';

type Status = ReviewStatus | InvoiceStatus;

const STATUS_CONFIG: Record<Status, { dark: string; light: string; darkDot: string; lightDot: string }> = {
  Pending:     { dark: 'bg-amber-500/10 text-amber-400 border-amber-500/25',      light: 'bg-amber-50 text-amber-700 border-amber-300',      darkDot: 'bg-amber-400',   lightDot: 'bg-amber-500'   },
  Approved:    { dark: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', light: 'bg-emerald-50 text-emerald-700 border-emerald-300', darkDot: 'bg-emerald-400', lightDot: 'bg-emerald-600' },
  Declined:    { dark: 'bg-red-500/10 text-red-400 border-red-500/25',             light: 'bg-red-50 text-red-700 border-red-300',             darkDot: 'bg-red-400',     lightDot: 'bg-red-500'     },
  'Timed out': { dark: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/25',          light: 'bg-zinc-100 text-zinc-600 border-zinc-300',         darkDot: 'bg-zinc-400',    lightDot: 'bg-zinc-500'    },
  Handoff:     { dark: 'bg-blue-500/10 text-blue-400 border-blue-500/25',          light: 'bg-blue-50 text-blue-700 border-blue-300',          darkDot: 'bg-blue-400',    lightDot: 'bg-blue-500'    },
  Review:            { dark: 'bg-blue-500/10 text-blue-400 border-blue-500/25',          light: 'bg-blue-50 text-blue-700 border-blue-300',          darkDot: 'bg-blue-400',    lightDot: 'bg-blue-500'    },
  Sent:              { dark: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', light: 'bg-emerald-50 text-emerald-700 border-emerald-300', darkDot: 'bg-emerald-400', lightDot: 'bg-emerald-600' },
  'Sent to AP':        { dark: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', light: 'bg-emerald-50 text-emerald-700 border-emerald-300', darkDot: 'bg-emerald-400', lightDot: 'bg-emerald-600' },
  'Sent to Requester': { dark: 'bg-blue-500/10 text-blue-400 border-blue-500/25',          light: 'bg-blue-50 text-blue-700 border-blue-300',          darkDot: 'bg-blue-400',    lightDot: 'bg-blue-500'    },
  Submitted:   { dark: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', light: 'bg-emerald-50 text-emerald-700 border-emerald-300', darkDot: 'bg-emerald-400', lightDot: 'bg-emerald-600' },
  Discarded:   { dark: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/25',          light: 'bg-zinc-100 text-zinc-600 border-zinc-300',         darkDot: 'bg-zinc-400',    lightDot: 'bg-zinc-500'    },
  Success:     { dark: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', light: 'bg-emerald-50 text-emerald-700 border-emerald-300', darkDot: 'bg-emerald-400', lightDot: 'bg-emerald-600' },
  Rerouted:    { dark: 'bg-amber-500/10 text-amber-400 border-amber-500/25',       light: 'bg-amber-50 text-amber-700 border-amber-300',       darkDot: 'bg-amber-400',   lightDot: 'bg-amber-500'   },
  Failed:      { dark: 'bg-red-500/10 text-red-400 border-red-500/25',             light: 'bg-red-50 text-red-700 border-red-300',             darkDot: 'bg-red-400',     lightDot: 'bg-red-500'     },
  Terminated:  { dark: 'bg-red-500/10 text-red-400 border-red-500/25',             light: 'bg-red-50 text-red-700 border-red-300',             darkDot: 'bg-red-400',     lightDot: 'bg-red-500'     },
  Matched:     { dark: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', light: 'bg-emerald-50 text-emerald-700 border-emerald-300', darkDot: 'bg-emerald-400', lightDot: 'bg-emerald-600' },
  Open:        { dark: 'bg-amber-500/10 text-amber-400 border-amber-500/25',       light: 'bg-amber-50 text-amber-700 border-amber-300',       darkDot: 'bg-amber-400',   lightDot: 'bg-amber-500'   },
};

export default function StatusBadge({ status }: { status: Status }) {
  const { theme } = useHQTheme();
  const cfg = STATUS_CONFIG[status];
  const badgeClass = theme === 'light' ? cfg.light : cfg.dark;
  const dotClass   = theme === 'light' ? cfg.lightDot : cfg.darkDot;

  return (
    <Badge variant="outline" className={`rounded-full gap-1.5 py-1 ${badgeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
      {status}
    </Badge>
  );
}
