import { ChartBarIcon as ChartBar, CurrencyDollarIcon as CurrencyDollar } from "@phosphor-icons/react";

/** Section header with icon and label */
function CardHeader({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2">
            <Icon size={16} weight="bold" className="text-foreground flex-shrink-0" />
            <p className="text-sm font-semibold text-foreground/80 uppercase leading-7">{children}</p>
        </div>
    );
}

function Subtle({ children }: { children: React.ReactNode }) {
    return <p className="text-[12px] text-foreground/70 leading-snug">{children}</p>;
}

/** Abbreviate large numbers: 198742 → "198.7K" */
function abbrev(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
    return n.toLocaleString();
}

export default function OverviewBottomStats() {
    /** Account-level reconciliation rates — varied but averaging 99.97% (135 unmatched of 450,312) */
    const reconAccounts = [
        { name: 'UAE CB – Main', matched: 202_419, total: 202_480 },
        { name: 'Deutsche Bank USD', matched: 125_052, total: 125_102 },
        { name: 'BNP Paribas EUR', matched: 74_915, total: 74_930 },
        { name: 'NatWest GBP', matched: 47_791, total: 47_800 },
    ];

    /** Cost breakdown — sub-items per-tx rates consistent with total (USD 842 / ~450K tx = 0.0019) */
    const costItems = [
        { name: 'UAE Central Bank', cost: 'USD 504', perTx: 'USD 0.0011 / tx', value: 504, color: '#3b82f6' },
        { name: 'Nostro (multi-curr.)', cost: 'USD 338', perTx: 'USD 0.0008 / tx', value: 338, color: '#14b8a6' },
    ];
    const costTotal = costItems.reduce((s, c) => s + c.value, 0);
    const size = 64;
    const strokeW = 7;
    const r = (size - strokeW) / 2;
    const circ = 2 * Math.PI * r;

    let accumulated = 0;
    const arcs = costItems.map((item) => {
        const pct = item.value / costTotal;
        const dashLen = circ * pct;
        const dashGap = circ - dashLen;
        const offset = -accumulated;
        accumulated += dashLen;
        return { ...item, dashLen, dashGap, offset };
    });

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* ── Card 1: Accounts — simple text rows ── */}
            <div className="bg-card border border-border rounded-xl px-5 py-4 flex flex-col gap-3">
                <CardHeader icon={ChartBar}>Top Accounts Reconciliation %</CardHeader>
                <div className="flex flex-col">
                    {reconAccounts.map((a) => {
                        const pct = ((a.matched / a.total) * 100).toFixed(2);
                        return (
                            <div key={a.name} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-b-0">
                                <div>
                                    <span className="text-[12px] font-semibold text-foreground">{a.name}</span>
                                    <Subtle>{abbrev(a.matched)}/{abbrev(a.total)} matched</Subtle>
                                </div>
                                <span className="text-[13px] font-bold text-emerald-500 tabular-nums">{pct}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Card 2: Cost with donut ── */}
            <div className="bg-card border border-border rounded-xl px-5 py-4 flex flex-col gap-4">
                <CardHeader icon={CurrencyDollar}>Cost (USD)</CardHeader>
                <div>
                    <div className="text-[26px] font-bold text-foreground leading-none">USD 842</div>
                    <p className="text-[12px] text-foreground/50 mt-1">USD 0.0019 per transaction</p>
                </div>
                <div className="border-t border-border/50 pt-3 flex items-center gap-5">
                    {/* Donut */}
                    <svg width={size} height={size} className="-rotate-90 flex-shrink-0">
                        <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-muted" strokeWidth={strokeW} />
                        {arcs.map((arc) => (
                            <circle
                                key={arc.name}
                                cx={size / 2}
                                cy={size / 2}
                                r={r}
                                fill="none"
                                stroke={arc.color}
                                strokeWidth={strokeW}
                                strokeDasharray={`${arc.dashLen} ${arc.dashGap}`}
                                strokeDashoffset={arc.offset}
                                strokeLinecap="round"
                            />
                        ))}
                    </svg>
                    {/* Legend */}
                    <div className="flex flex-col gap-2">
                        {costItems.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-semibold text-foreground">{item.name}</span>
                                        <span className="text-[11px] font-semibold text-foreground/60 tabular-nums whitespace-nowrap">{item.cost}</span>
                                    </div>
                                    <Subtle>{item.perTx}</Subtle>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
