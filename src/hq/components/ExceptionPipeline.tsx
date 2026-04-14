/** Pipeline visualising where the 135 open exception items currently sit. */

import { useHQTheme } from '@/hq/context';

const STAGES = [
    { count: '450,177', label: 'Auto-matched', detail: 'No action needed', variant: 'done' as const },
    { count: '47', label: 'Under investigation', detail: 'IT / ASCOE reviewing', variant: 'it' as const },
    { count: '88', label: 'Sent to departments', detail: 'Awaiting confirmation', variant: 'active' as const },
    { count: '0', label: 'Resolved today', detail: 'Pending end-of-day', variant: 'neutral' as const },
];

/** Returns theme-aware classes for each pipeline stage variant. */
function getVariantStyles(isDark: boolean): Record<string, { bg: string; text: string; label: string }> {
    if (isDark) {
        return {
            done: { bg: 'bg-emerald-900/40 border-emerald-700', text: 'text-emerald-400', label: 'text-foreground/60' },
            it: { bg: 'bg-indigo-900/40 border-indigo-700', text: 'text-indigo-400', label: 'text-foreground/60' },
            active: { bg: 'bg-amber-900/40 border-amber-700', text: 'text-amber-400', label: 'text-foreground/60' },
            neutral: { bg: 'bg-card border-border', text: 'text-foreground', label: 'text-foreground/60' },
        };
    }
    return {
        done: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-600', label: 'text-emerald-800/60' },
        it: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-600', label: 'text-indigo-800/60' },
        active: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-600', label: 'text-amber-800/60' },
        neutral: { bg: 'bg-card border-border', text: 'text-foreground', label: 'text-foreground/60' },
    };
}

export default function ExceptionPipeline() {
    const { theme } = useHQTheme();
    const isDark = theme === 'dark';
    const variants = getVariantStyles(isDark);
    return (
        <div className="bg-card border border-border rounded-xl px-5 py-4 h-full flex flex-col gap-4">
            <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                Exception pipeline — where are the open items?
            </p>
            <div className="flex-1 grid grid-cols-4 min-h-[120px]">
                {STAGES.map((stage, idx) => {
                    const style = variants[stage.variant];
                    const isLast = idx === STAGES.length - 1;
                    return (
                        <div
                            key={stage.label}
                            className={`relative flex flex-col items-center justify-center text-center border px-3 py-4 ${style.bg} ${idx === 0 ? 'rounded-l-xl' : ''} ${isLast ? 'rounded-r-xl' : 'border-r-0'}`}
                        >
                            <span className={`text-2xl font-bold tabular-nums ${style.text}`}>{stage.count}</span>
                            <span className={`text-[11px] font-medium mt-1 ${style.label}`}>{stage.label}</span>
                            <span className={`text-[10px] mt-0.5 ${style.label}`}>{stage.detail}</span>
                            {/* Chevron arrow */}
                            {!isLast && (
                                <span className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-foreground/20 text-xl leading-none select-none">
                                    ▸
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
