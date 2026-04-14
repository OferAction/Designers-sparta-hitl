import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RunDataPoint } from '@/hq/types';
import { useHQTheme } from '@/hq/context';

interface Props {
  data: RunDataPoint[];
}

export default function MiniRunsChart({ data }: Props) {
  const { theme } = useHQTheme();
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1c2133' : '#e8edf8';
  const tickColor = isDark ? 'rgba(196,204,232,0.55)' : 'rgba(28,36,68,0.55)';

  return (
    <div className="bg-card border border-border rounded-xl px-2 py-2 h-full flex flex-col">
      <p className="text-xs font-semibold text-foreground/80 uppercase tracking-wide px-1 mb-1 flex-shrink-0">Runs</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={12} barCategoryGap="20%" margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: tickColor, fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="rounded-lg px-3 py-2 text-sm shadow-xl border bg-popover border-border">
                    <p className="font-semibold text-foreground/60 mb-1">{label}</p>
                    <p style={{ color: '#22d3ee' }}>{d?.success?.toLocaleString()} Success</p>
                    <p style={{ color: '#818cf8' }}>{d?.rerouted ?? 0} Rerouted</p>
                    <p style={{ color: '#f87171' }}>{d?.terminated ?? 0} Terminated</p>
                  </div>
                );
              }}
              cursor={{ fill: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,50,0.04)' }}
            />
            <Bar dataKey="success"    stackId="a" fill="#22d3ee" />
            <Bar dataKey="rerouted"   stackId="a" fill="#818cf8" />
            <Bar dataKey="terminated" stackId="a" fill="#f87171" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
