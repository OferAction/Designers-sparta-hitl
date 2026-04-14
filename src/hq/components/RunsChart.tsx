import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import { runData as defaultRunData } from '@/hq/data/mockData';
import { useHQTheme } from '@/hq/context';
import { RunDataPoint } from '@/hq/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, isDark }: any) {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
        <div
            className="rounded-xl px-4 py-3 text-sm shadow-2xl border"
            style={{
                background: isDark ? '#151929' : '#ffffff',
                borderColor: isDark ? '#273048' : '#dce4f2',
            }}
        >
            <p className="font-semibold mb-2.5" style={{ color: isDark ? '#8490b2' : '#67789e' }}>{label}</p>
            <div className="flex flex-col gap-1.5 min-w-[168px]">
                <div className="flex justify-between gap-6">
                    <span style={{ color: isDark ? '#c4cce8' : '#1c2444' }}>{d?.total?.toLocaleString()} Total</span>
                </div>
                <div className="flex justify-between gap-6">
                    <span style={{ color: '#22d3ee' }}>{d?.matched?.toLocaleString() ?? d?.success?.toLocaleString()} Matched</span>
                </div>
                <div className="flex justify-between gap-6">
                    <span style={{ color: '#f59e0b' }}>{d?.open?.toLocaleString() ?? ((d?.rerouted ?? 0) + (d?.terminated ?? 0)).toLocaleString()} Open</span>
                </div>
            </div>
        </div>
    );
}

function LegendDot({ color, label }: { color: string; label: string }) {
    return (
        <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: color }} />
            {label}
        </span>
    );
}

export default function RunsChart({ data, dateRange }: { data?: RunDataPoint[]; dateRange?: string }) {
    const { theme } = useHQTheme();
    const isDark = theme === 'dark';
    const gridColor = isDark ? '#1c2133' : '#e8edf8';
    const tickColor = isDark ? 'rgba(196,204,232,0.8)' : 'rgba(28,36,68,0.8)';
    const chartData = data ?? defaultRunData;
    const transactionData = chartData.map((point) => ({
        ...point,
        matched: point.success,
        open: point.rerouted + point.terminated,
    }));

    const is1Day = dateRange === '1d';

    /* ── 1-Day: Pie chart view — use aggregate totals (99.97% match rate) ── */
    if (is1Day) {
        const totalTransactions = 450_312;
        const matchedCount = 450_177;
        const openCount = totalTransactions - matchedCount;
        const pieData = [
            { name: 'Matched', value: matchedCount, color: '#22d3ee' },
            { name: 'Open', value: openCount, color: '#f59e0b' },
        ];
        const total = totalTransactions;

        return (
            <div className="bg-card border border-border rounded-xl px-4 pt-3 pb-6 flex flex-col gap-2 h-full">
                <div className="flex items-center justify-between flex-shrink-0">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Transactions — 1 Day</h3>
                    <div className="flex items-center gap-4 text-[11px] uppercase tracking-wide text-foreground/80">
                        <LegendDot color="#22d3ee" label="Matched" />
                        <LegendDot color="#f59e0b" label="Open" />
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center min-h-0 py-2">
                    <div className="flex items-center justify-center gap-6 w-full h-full">
                        {/* Donut */}
                        <div className="h-full max-h-[160px] aspect-square flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="65%"
                                        outerRadius="90%"
                                        paddingAngle={2}
                                        strokeWidth={0}
                                    >
                                        {pieData.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        isAnimationActive={false}
                                        formatter={(value: number, name: string) => [`${value.toLocaleString()}`, name]}
                                        contentStyle={{
                                            background: isDark ? '#151929' : '#ffffff',
                                            borderColor: isDark ? '#273048' : '#dce4f2',
                                            borderRadius: 12,
                                            fontSize: 13,
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Stats */}
                        <div className="flex flex-col gap-3">
                            <div>
                                <p className="text-[28px] font-bold text-foreground leading-none">{total.toLocaleString()}</p>
                                <p className="text-[12px] text-foreground/60 mt-1">Total transactions</p>
                            </div>
                            {pieData.map((seg) => (
                                <div key={seg.name} className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
                                    <span className="text-sm text-foreground/80">{seg.name}</span>
                                    <span className="text-sm font-semibold text-foreground tabular-nums">{seg.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-xl px-4 pt-3 pb-6 flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between flex-shrink-0">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Transactions</h3>
                <div className="flex items-center gap-4 text-[11px] uppercase tracking-wide text-foreground/80">
                    <LegendDot color="#22d3ee" label="Matched" />
                    <LegendDot color="#f59e0b" label="Open" />
                </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionData} barSize={40} barCategoryGap="10%">
                    <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} width={36} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
                    <Tooltip
                        isAnimationActive={false}
                        content={<CustomTooltip isDark={isDark} />}
                        cursor={{ fill: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,50,0.04)' }}
                    />
                    <Bar dataKey="matched" stackId="a" fill="#22d3ee" />
                    <Bar dataKey="open" stackId="a" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
