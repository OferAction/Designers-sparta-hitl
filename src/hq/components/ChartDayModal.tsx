import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { XIcon as X, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RunDataPoint } from '@/hq/types';
import { useHQTheme } from '@/hq/context';

const SUCCESS_COLOR  = '#22d3ee';
const REROUTE_COLOR  = '#818cf8';
const TERM_COLOR     = '#f87171';

interface Props {
  day: RunDataPoint;
  allData: RunDataPoint[];
  onClose: () => void;
}

function expandSampleRuns(samples: string[], total: number) {
  if (total <= 0) return [];
  if (samples.length === 0) {
    return Array.from({ length: total }, (_, index) => `RUN-${String(index + 1).padStart(4, '0')}`);
  }

  const seed = samples[0];
  return Array.from({ length: total }, (_, index) => {
    const match = seed.match(/^(.*?)(\d+)([^\d]*)$/);
    if (!match) return `${seed}-${index + 1}`;
    const [, prefix, numeric, suffix] = match;
    const next = String(Number.parseInt(numeric, 10) + index).padStart(numeric.length, '0');
    return `${prefix}${next}${suffix}`;
  });
}

function BreakdownRow({
  label,
  value,
  total,
  color,
  selected,
  onSelect,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const { theme } = useHQTheme();
  const isDark = theme === 'dark';
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const percentColor = isDark ? 'rgba(214,223,248,0.88)' : 'rgba(22,33,61,0.82)';
  const labelColor = 'hsl(var(--primary))';
  const selectedBg = isDark ? 'rgba(129, 140, 248, 0.1)' : 'rgba(129, 140, 248, 0.08)';

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-xl overflow-hidden text-left transition-colors"
      style={{
        background: selected ? selectedBg : undefined,
      }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: labelColor }}>{label}</span>
          <span className="text-sm font-bold tabular-nums ml-auto" style={{ color }}>
            {value.toLocaleString()}
            <span className="text-xs font-medium ml-1.5" style={{ color: percentColor }}>({pct}%)</span>
          </span>
        </div>
      </div>
    </button>
  );
}

function DetailPane({
  color,
  samples,
  total,
}: {
  color: string;
  samples: string[];
  total: number;
}) {
  const { theme } = useHQTheme();
  const isDark = theme === 'dark';
  const mutedText = isDark ? 'rgba(214,223,248,0.78)' : 'rgba(22,33,61,0.72)';
  const sampleTextColor = isDark ? 'rgba(238,244,255,0.94)' : 'rgba(18,32,61,0.92)';
  const detailRuns = expandSampleRuns(samples, total);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-0.5 flex flex-col gap-1.5">
        {detailRuns.length > 0 ? (
          detailRuns.map((ref) => (
            <div key={ref} className="flex items-center gap-3 rounded-lg px-2.5 py-1.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-sm font-mono break-all" style={{ color: sampleTextColor }}>{ref}</span>
            </div>
          ))
        ) : (
          <div className="text-sm" style={{ color: mutedText }}>
            No sample runs available for this category.
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChartDayModal({ day: initialDay, allData, onClose }: Props) {
  const { theme } = useHQTheme();
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1c2133' : '#e8edf8';
  const tickColor = isDark ? 'rgba(196,204,232,0.7)' : 'rgba(28,36,68,0.7)';
  const modalBackground = isDark ? 'hsl(223 39% 9%)' : 'hsl(214 58% 97%)';
  const modalBorder = isDark ? 'hsl(215 25% 32% / 0.92)' : 'hsl(215 38% 66% / 0.92)';
  const modalShadow = isDark ? '0 28px 80px rgba(0, 0, 0, 0.58)' : '0 28px 80px rgba(15, 23, 42, 0.22)';
  const mutedText = isDark ? 'rgba(214,223,248,0.82)' : 'rgba(22,33,61,0.78)';
  const tooltipBackground = isDark ? '#0b1220' : '#f4f8ff';
  const tooltipBorder = isDark ? '#40506f' : '#a9bfe6';
  const tooltipLabel = isDark ? '#eef4ff' : '#12203d';

  const [day, setDay] = useState(initialDay);
  const [selectedSection, setSelectedSection] = useState<'Success' | 'Rerouted' | 'Terminated'>('Success');
  const currentIdx = allData.findIndex(d => d.date === day.date);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < allData.length - 1;

  const sections = [
    { label: 'Success' as const, value: day.success, color: SUCCESS_COLOR, samples: day.samples?.success ?? [] },
    { label: 'Rerouted' as const, value: day.rerouted, color: REROUTE_COLOR, samples: day.samples?.rerouted ?? [] },
    { label: 'Terminated' as const, value: day.terminated, color: TERM_COLOR, samples: day.samples?.terminated ?? [] },
  ];
  const activeSection = sections.find((section) => section.label === selectedSection) ?? sections[0];

  useEffect(() => {
    setSelectedSection('Success');
  }, [day.date]);

  return createPortal(
    <div className="hq-layout fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'hsl(var(--background) / 0.8)' }} onClick={onClose}>
      <div
        className="relative rounded-2xl shadow-2xl flex flex-col overflow-hidden bg-background text-foreground"
        style={{
          background: modalBackground,
          border: `1px solid ${modalBorder}`,
          boxShadow: modalShadow,
          width: '980px',
          maxWidth: '95vw',
          height: '760px',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-3 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => hasPrev && setDay(allData[currentIdx - 1])}
                disabled={!hasPrev}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-foreground/50 hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <CaretLeftIcon size={13} />
              </button>
              <button
                onClick={() => hasNext && setDay(allData[currentIdx + 1])}
                disabled={!hasNext}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-border text-foreground/50 hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <CaretRightIcon size={13} />
              </button>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide" style={{ color: mutedText }}>Run details</p>
              <p className="text-xl font-bold text-foreground">{day.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-2xl font-bold text-foreground">{day.total.toLocaleString()}</span>
              <span className="text-sm ml-2" style={{ color: mutedText }}>total runs</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:text-foreground transition-colors" style={{ color: mutedText }}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-5 pb-3 flex-shrink-0" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={allData} barSize={28} barCategoryGap="12%" onClick={(data: any) => { if (data?.activePayload?.[0]) setDay(data.activePayload[0].payload); }} style={{ cursor: 'pointer' }}>
              <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} width={34} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  const isSelected = d?.date === day.date;
                  return (
                    <div className="rounded-lg px-3 py-2 text-xs shadow-xl border" style={{ background: tooltipBackground, borderColor: tooltipBorder }}>
                      <p className="font-semibold mb-1" style={{ color: isSelected ? tooltipLabel : mutedText }}>{label}</p>
                      <p style={{ color: SUCCESS_COLOR }}>{d?.success?.toLocaleString()} Success</p>
                      <p style={{ color: REROUTE_COLOR }}>{d?.rerouted ?? 0} Rerouted</p>
                      <p style={{ color: TERM_COLOR }}>{d?.terminated ?? 0} Terminated</p>
                    </div>
                  );
                }}
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,50,0.04)' }}
              />
              <Bar dataKey="success" stackId="a">
                {allData.map((entry) => <Cell key={entry.date} fill={SUCCESS_COLOR} opacity={entry.date === day.date ? 1 : 0.35} />)}
              </Bar>
              <Bar dataKey="rerouted" stackId="a">
                {allData.map((entry) => <Cell key={entry.date} fill={REROUTE_COLOR} opacity={entry.date === day.date ? 1 : 0.35} />)}
              </Bar>
              <Bar dataKey="terminated" stackId="a" radius={[3, 3, 0, 0]}>
                {allData.map((entry) => <Cell key={entry.date} fill={TERM_COLOR} opacity={entry.date === day.date ? 1 : 0.35} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mx-7 border-t border-border flex-shrink-0" />

        <div className="flex-1 min-h-0 px-7 py-4 grid grid-cols-[320px_minmax(0,1fr)] gap-4">
          <div className="min-h-0 flex flex-col gap-1.5 overflow-y-auto pr-1">
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: mutedText }}>Breakdown</p>
            {sections.map(({ label, value, color }) => (
              <BreakdownRow
                key={label}
                label={label}
                value={value}
                total={day.total}
                color={color}
                selected={activeSection.label === label}
                onSelect={() => setSelectedSection(label)}
              />
            ))}
          </div>
          <div className="min-h-0 border-l border-border pl-5">
            <DetailPane
              color={activeSection.color}
              samples={activeSection.samples}
              total={activeSection.value}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
