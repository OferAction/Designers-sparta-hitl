/** Two side-by-side donuts showing where exceptions were routed. */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useHQTheme } from '@/hq/context';

interface LegendItem {
    name: string;
    value: number;
    valueLabel: string;
    color: string;
}

const OPEN_ITEMS: LegendItem[] = [
    { name: 'Matching issues', value: 88, valueLabel: 'AED 1.9M', color: '#f59e0b' },
    { name: 'Statement gaps', value: 47, valueLabel: 'AED 500K', color: '#6366f1' },
];

const DEPT_ITEMS: LegendItem[] = [
    { name: 'Treasury', value: 41, valueLabel: 'AED 890K', color: '#6366f1' },
    { name: 'Trade Finance', value: 28, valueLabel: 'AED 640K', color: '#0d9488' },
    { name: 'Corp. Banking', value: 19, valueLabel: 'AED 370K', color: '#8b5cf6' },
];

/** Donut half with legend underneath. */
function DonutSection({ title, centerNum, centerLabel, items, totalLabel }: {
    title: string;
    centerNum: string;
    centerLabel: string;
    items: LegendItem[];
    totalLabel: string;
}) {
    const { theme } = useHQTheme();
    const isDark = theme === 'dark';

    return (
        <div className="flex-1 flex flex-col items-center px-4 py-5">
            <p className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider mb-4">{title}</p>
            {/* Donut with center label */}
            <div className="relative w-[200px] h-[200px] mb-5">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={items}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            innerRadius="60%"
                            outerRadius="88%"
                            paddingAngle={2}
                            strokeWidth={0}
                        >
                            {items.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            isAnimationActive={false}
                            formatter={(value: number, name: string) => [`${value}`, name]}
                            contentStyle={{
                                background: isDark ? '#151929' : '#ffffff',
                                borderColor: isDark ? '#273048' : '#dce4f2',
                                borderRadius: 12,
                                fontSize: 13,
                            }}
                            wrapperStyle={{ zIndex: 50 }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[28px] font-bold text-foreground leading-none">{centerNum}</span>
                    <span className="text-[10px] text-foreground/40 uppercase tracking-wider mt-1">{centerLabel}</span>
                </div>
            </div>
            {/* Legend */}
            <div className="w-full space-y-1">
                {items.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-b-0">
                        <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-bold tabular-nums" style={{ color: item.color }}>{item.value}</span>
                        <span className="flex-1 text-[13px] text-foreground/60">{item.name}</span>
                        <span className="text-[12px] text-foreground/40">{item.valueLabel}</span>
                    </div>
                ))}
            </div>
            <p className="text-[11px] text-foreground/40 mt-2 pt-2 border-t border-border/50 text-center w-full">
                Total: {totalLabel}
            </p>
        </div>
    );
}

export default function ExceptionRouted() {
    return (
        <div className="bg-card border border-border rounded-xl h-full flex flex-col">
            <div className="px-5 pt-4 pb-2">
                <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                    Where the exceptions were routed
                </p>
            </div>
            <div className="flex-1 flex divide-x divide-border">
                <DonutSection
                    title="Open transactions"
                    centerNum="135"
                    centerLabel="Open"
                    items={OPEN_ITEMS}
                    totalLabel="AED 2.4M"
                />
                <DonutSection
                    title="Routed to departments"
                    centerNum="88"
                    centerLabel="Sent"
                    items={DEPT_ITEMS}
                    totalLabel="AED 1.9M"
                />
            </div>
        </div>
    );
}
