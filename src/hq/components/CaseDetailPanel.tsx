import { useState, useEffect } from 'react';
import { ReviewRequest, Reviewer } from '@/hq/types';
import { CheckCircleIcon as CheckCircle2, ArrowLeftIcon as ArrowLeft, InfoIcon as Info, CheckIcon, XIcon } from "@phosphor-icons/react";
import AttachmentModal from './AttachmentModal';
import StatusBadge from './StatusBadge';
import { useHQActOne } from '@/hq/context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getReviewContent, hasReviewContent } from '@/hq/reviewContent';

interface Props {
    review: ReviewRequest;
    currentUser: Reviewer;
    width?: number | string;
    mobile?: boolean;
    onBack?: () => void;
    actoneOpen?: boolean;
}

/** Determines audit entry visual type based on action text */
function getAuditType(action: string): 'approve' | 'escalate' | 'notify' | 'trigger' {
    if (action.toLowerCase().includes('approv')) return 'approve';
    if (action.toLowerCase().includes('escalat')) return 'escalate';
    if (action.toLowerCase().includes('notif')) return 'notify';
    return 'trigger';
}

/** Renders person names in bold within audit trail text */
function BoldNames({ text }: { text: string }) {
    const parts = text.split(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)\b/);
    return (
        <>
            {parts.map((part, i) =>
                i % 2 === 1
                    ? <span key={i} className="font-bold">{part}</span>
                    : part
            )}
        </>
    );
}

/** Case detail side panel — FYI-only flow for "Notify & end execution" reviews */
export default function CaseDetailPanel({ review, currentUser, width = 320, mobile = false, onBack, actoneOpen = false }: Props) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const { blurActOneInput } = useHQActOne();
    void blurActOneInput;
    void actoneOpen;

    useEffect(() => {
        setLightboxIndex(null);
    }, [review.id]);

    const inv = review.invoice;
    if (!inv) return null;
    const usesReviewContent = hasReviewContent(review);
    const reviewContent = usesReviewContent ? getReviewContent(review) : null;
    const descriptionText = reviewContent?.judgeExplanation ?? inv.description;

    const isAssignedToMe = review.assignedTo.id === currentUser.id;
    const canAct = review.status === 'Pending' && isAssignedToMe;

    const fieldRows = reviewContent ? [
        { label: 'Subject Reference', value: reviewContent.subjectReference },
        { label: 'Subject Description', value: reviewContent.subjectDescription },
        { label: 'Matched Candidate Reference', value: reviewContent.matchedCandidateReference },
        { label: 'Matched Candidate Description', value: reviewContent.matchedCandidateDescription },
        { label: 'Nostro Amount', value: reviewContent.nostroAmount },
        { label: 'Vostro Amount', value: reviewContent.vostroAmount },
        { label: 'Discrepancy Amount', value: reviewContent.discrepancyAmount },
        { label: 'Final Explanation', value: reviewContent.finalExplanation },
    ] : [
        { label: 'Vendor', value: inv.vendor },
        { label: 'Amount', value: inv.price.toLocaleString('en-US') },
        { label: 'Billing Date', value: inv.billingDate },
        { label: 'PO Number', value: inv.poNumber },
        { label: 'Items', value: String(inv.items) },
    ];

    const px = mobile ? 'px-4' : 'px-5';

    return (
        <>
            <div
                className={`flex flex-col min-h-0 h-full overflow-hidden ${mobile ? 'flex-1 w-full' : 'flex-shrink-0 flex-grow-0 rounded-tr-xl'}`}
                style={{
                    ...(mobile ? {} : { width }),
                    background: 'hsl(var(--general-primary-foreground))',
                    border: '1px solid var(--border-subtle)',
                }}
            >
                {/* Mobile back header */}
                {mobile && onBack && (
                    <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium transition-colors" style={{ color: 'hsl(var(--foreground) / 0.8)' }}>
                            <ArrowLeft size={16} />
                            Back
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className={`${px} py-4`}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <h3 className="font-bold text-base leading-snug truncate" style={{ color: 'hsl(var(--foreground) / 0.8)' }}>
                                            {reviewContent?.subjectDescription ?? review.reason}
                                        </h3>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">{reviewContent?.subjectDescription ?? review.reason}</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="flex-shrink-0 mt-0.5">
                            <StatusBadge status={review.status} />
                        </div>
                    </div>
                    <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: 'hsl(var(--foreground) / 0.6)' }}>
                        Notify &amp; End Execution
                    </p>
                </div>

                {/* Scrollable content */}
                <div className={`flex-1 overflow-y-auto ${px} py-4 flex flex-col gap-5`}>
                    {/* Main content card */}
                    <div className="rounded-xl" style={{ border: '1px solid var(--border-subtle)', background: 'hsl(var(--muted))' }}>
                        <div className="px-4 pt-3 pb-3.5 flex flex-col gap-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <span className={`font-bold ${mobile ? 'text-[13px]' : 'text-sm'}`} style={{ color: 'hsl(var(--foreground) / 0.65)' }}>Description</span>
                            <span className={`leading-normal break-words whitespace-pre-wrap ${mobile ? 'text-[13px]' : 'text-base'}`} style={{ color: 'hsl(var(--foreground))' }}>{descriptionText}</span>
                        </div>
                        {fieldRows.map(({ label, value }) => (
                            label === 'Final Explanation' ? (
                                <div key={label} className="px-4 py-2.5 flex flex-col gap-2">
                                    <span className={`font-bold ${mobile ? 'text-[13px]' : 'text-sm'}`} style={{ color: 'hsl(var(--foreground) / 0.65)' }}>{label}</span>
                                    <span className={`text-left break-words ${mobile ? 'text-[13px]' : 'text-sm'}`} style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
                                </div>
                            ) : (
                                <div key={label} className="flex items-start gap-8 px-4 py-2.5">
                                    <span className={`flex-shrink-0 w-40 font-bold ${mobile ? 'text-[13px]' : 'text-sm'}`} style={{ color: 'hsl(var(--foreground) / 0.65)' }}>{label}</span>
                                    <span className={`flex-1 text-left break-words ${mobile ? 'text-[13px]' : 'text-sm'}`} style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
                                </div>
                            )
                        ))}
                    </div>

                    {/* Audit trail */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'hsl(var(--foreground) / 0.8)' }}>Audit Trail</p>
                        <div className="flex flex-col">
                            {inv.auditTrail.map((entry, i, arr) => {
                                const type = getAuditType(entry.action);
                                const isLast = i === arr.length - 1;
                                return (
                                    <div key={entry.id} className="flex gap-3">
                                        <div className="flex flex-col items-center flex-shrink-0 w-5">
                                            {type === 'approve' ? (
                                                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" strokeWidth={2} />
                                            ) : (
                                                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: 'hsl(var(--ring))' }} />
                                            )}
                                            {!isLast && <div className="w-px flex-1 mt-1.5 mb-1" style={{ background: 'hsl(var(--ring))' }} />}
                                        </div>
                                        <div className="pb-5">
                                            <p className={`leading-snug ${mobile ? 'text-[13px]' : 'text-sm'}`} style={{ color: 'hsl(var(--foreground) / 0.8)' }}>
                                                {entry.actor !== 'System' && (<><span className="font-bold">{entry.actor}</span>{' '}</>)}
                                                <BoldNames text={entry.action} />
                                            </p>
                                            {entry.comment && <p className={`mt-1 italic ${mobile ? 'text-[13px]' : 'text-sm'}`} style={{ color: 'hsl(var(--foreground) / 0.8)' }}>"{entry.comment}"</p>}
                                            <p className={`mt-1 ${mobile ? 'text-[13px]' : 'text-sm'}`} style={{ color: 'hsl(var(--foreground) / 0.8)' }}>{entry.timestamp}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer — action buttons or FYI */}
                <div
                    className={`flex-shrink-0 ${mobile ? 'px-4 pt-3 pb-6' : 'px-5 pt-3 pb-4'}`}
                    style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-muted-50)' }}
                >
                    {canAct ? (
                        <div className="flex items-center gap-3">
                            <button
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-colors ${mobile ? 'text-[13px]' : 'text-sm'} bg-purple-accent hover:bg-purple-accent/85 text-white`}
                            >
                                <CheckIcon size={16} weight="bold" />
                                Accept
                            </button>
                            <button
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-colors ${mobile ? 'text-[13px]' : 'text-sm'}`}
                                style={{ background: 'hsl(var(--muted))', border: '1px solid var(--border-subtle)', color: 'hsl(var(--foreground) / 0.8)' }}
                            >
                                <XIcon size={16} weight="bold" />
                                Reject
                            </button>
                        </div>
                    ) : (
                        <div
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg ${mobile ? 'text-[13px]' : 'text-sm'}`}
                            style={{ background: 'hsl(var(--popover))', color: 'hsl(var(--foreground) / 0.6)' }}
                        >
                            <Info size={15} weight="fill" />
                            No action is required
                        </div>
                    )}
                </div>
            </div>

            {lightboxIndex !== null && (
                <AttachmentModal
                    attachments={inv.attachments}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </>
    );
}
