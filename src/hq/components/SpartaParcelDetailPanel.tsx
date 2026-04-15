import { useState, useEffect, type ReactNode } from 'react';
import { ReviewRequest, Reviewer, ApproverRecommendation } from '@/hq/types';
import { ArrowLeftIcon as ArrowLeft, CheckIcon, XIcon, FlagIcon, CheckCircleIcon, WarningCircleIcon, FileTextIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import StatusBadge from './StatusBadge';

interface Props {
  review: ReviewRequest;
  currentUser: Reviewer;
  width?: number | string;
  mobile?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  onApprove?: (review: ReviewRequest) => void;
  onReject?: (review: ReviewRequest) => void;
}

function fmt(n: number | null | undefined) {
  if (n == null) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function BudgetBar({ pct }: { pct: number }) {
  const capped = Math.min(pct, 100);
  const color = pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="w-full h-1.5 rounded-full bg-muted mt-1.5">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${capped}%` }} />
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'hsl(var(--foreground) / 0.6)' }}>
      {children}
    </p>
  );
}

function FieldGrid({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border-subtle)', background: 'hsl(var(--muted))' }}
    >
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-3.5 py-3">
        {rows.map(({ label, value }) => (
          <div key={label}>
            <p className="text-[12px] font-semibold mb-0.5" style={{ color: 'hsl(var(--foreground) / 0.7)' }}>{label}</p>
            <p className="text-sm leading-snug" style={{ color: 'hsl(var(--foreground) / 0.9)' }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Detail panel for the Approver role — parcel shipment request */
function ApproverPanel({ review, px, mobile }: { review: ReviewRequest; px: string; mobile: boolean }) {
  const d = review.parcelShipmentDetail!;
  const recLabel = d.recommendation.label.toLowerCase();
  const isGo    = recLabel.startsWith('go —') || recLabel === 'go';
  const isNoGo  = recLabel.startsWith('no go');
  // isGo → green  |  isNoGo → red  |  else → amber (caution)

  return (
    <div className={`flex-1 overflow-y-auto ${px} pb-4`}>
      {/* AI Recommendation — sticky label */}
      <div className="sticky top-0 z-10 flex items-center gap-3 pt-4 pb-3" style={{ background: 'hsl(var(--general-primary-foreground))' }}>
        <p className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: 'hsl(var(--foreground) / 0.6)' }}>AI Recommendation:</p>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${
            isGo
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/25 dark:text-emerald-300 dark:border-emerald-400/50'
              : isNoGo
                ? 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-500/25 dark:text-red-300 dark:border-red-400/50'
                : 'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-500/25 dark:text-amber-300 dark:border-amber-400/50'
          }`}
        >
          {isGo
            ? <CheckCircleIcon size={14} weight="fill" />
            : <WarningCircleIcon size={14} weight="fill" />}
          Accept
        </span>
      </div>

      <div className="flex flex-col gap-5">
      {/* Recommendation reason */}
      <div className="rounded-xl p-[1px]" style={{ background: 'linear-gradient(135deg, #3B82F6, #A855F7)' }}>
        <div className="rounded-xl p-3.5" style={{ background: 'hsl(var(--muted))' }}>
          <p className="text-sm leading-snug" style={{ color: 'hsl(var(--foreground) / 0.85)' }}>{d.recommendation.reason}</p>
        </div>
      </div>

      {/* Shipment Details */}
      <div>
        <SectionLabel>Shipment Details</SectionLabel>
        <FieldGrid rows={[
          { label: 'Item',                   value: d.item },
          { label: 'Requestor',              value: `${d.requestor.name} · ${d.requestor.dept}` },
          { label: 'Event',                  value: `${d.event.name} · ${d.event.customerId}` },
          { label: 'Expected delivery',      value: d.expectedDelivery },
          { label: 'Route',                  value: d.route },
          { label: 'Service / est. cost',    value: `${d.service} · $${fmt(d.estimatedCost)}` },
        ]} />
      </div>

      {/* Requestor Notes */}
      <div>
        <SectionLabel>Requestor Notes</SectionLabel>
        <div
          className={`rounded-xl p-3.5 flex flex-col gap-2 ${mobile ? 'text-[13px]' : 'text-sm'}`}
          style={{ background: 'hsl(var(--muted))', border: '1px solid var(--border-subtle)' }}
        >
          <p style={{ color: 'hsl(var(--foreground) / 0.85)' }}>{d.requestorNotes}</p>
          {d.amazonLink && (
            <a href={d.amazonLink} className="text-blue-400 hover:text-blue-300 underline underline-offset-2 w-fit">
              View Amazon link
            </a>
          )}
        </div>
      </div>

      {/* Budget Impact */}
      <div>
        <SectionLabel>Budget Impact</SectionLabel>
        <div
          className="rounded-xl overflow-hidden space-y-5 p-3.5"
          style={{ border: '1px solid var(--border-subtle)', background: 'hsl(var(--muted))' }}
        >
          {/* Event · Department · GL Code */}
          <div className="grid grid-cols-3 gap-x-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--foreground) / 0.45)' }}>Event</p>
              <p className="text-base font-bold" style={{ color: 'hsl(var(--foreground))' }}>{d.budgetImpact.event.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--foreground) / 0.5)' }}>{d.event.customerId}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--foreground) / 0.45)' }}>Department</p>
              <p className="text-base font-bold" style={{ color: 'hsl(var(--foreground))' }}>{d.apCoding.department}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--foreground) / 0.45)' }}>GL Code</p>
              <p className="text-base font-bold" style={{ color: 'hsl(var(--foreground))' }}>{d.apCoding.glAccount}</p>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--foreground) / 0.5)' }}>{d.apCoding.subsidiary}</p>
            </div>
          </div>

          {/* Department Budget bar */}
          {(() => {
            const b = d.budgetImpact.event;
            const total = b.total;
            const spent = b.current;
            const remaining = total - spent;
            const pct = b.pct;
            return (
              <div>
                <div className="flex items-end justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--foreground) / 0.45)' }}>Department Budget</p>
                  <p className="text-xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                {/* Bar with floating badge */}
                <div className="relative mt-1 mb-3">
                  <div
                    className="absolute -top-6 z-10 px-2 py-0.5 rounded text-[10px] font-bold text-white"
                    style={{ left: `${Math.min(pct, 100)}%`, transform: 'translateX(-50%)', background: 'hsl(var(--foreground) / 0.85)' }}
                  >
                    {pct}% used
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'hsl(var(--foreground) / 0.1)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(pct, 100)}%`, background: 'linear-gradient(90deg, #14b8a6, #3b82f6)', transition: 'width 0.4s ease' }}
                    />
                  </div>
                </div>
                {/* Used / Remaining */}
                <div className="flex items-center justify-between">
                  <p>
                    <span className="text-base font-bold" style={{ color: '#14b8a6' }}>${spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span className="text-xs ml-1" style={{ color: 'hsl(var(--foreground) / 0.45)' }}>used</span>
                  </p>
                  <p>
                    <span className="text-xs mr-1" style={{ color: 'hsl(var(--foreground) / 0.45)' }}>remaining</span>
                    <span className="text-base font-bold" style={{ color: 'hsl(var(--foreground))' }}>${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* AP Coding */}
      <div>
        <SectionLabel>AP Coding (Auto-suggested)</SectionLabel>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          <div className="grid grid-cols-2">
            {[
              { label: 'Subsidiary', value: d.apCoding.subsidiary },
              { label: 'Department', value: d.apCoding.department },
              { label: 'GL Account', value: d.apCoding.glAccount },
              { label: 'Customer ID', value: d.apCoding.customerId },
            ].map(({ label, value }, i) => (
              <div
                key={label}
                className="px-3.5 py-3"
                style={{
                  background: 'hsl(var(--muted))',
                  borderRight: i % 2 === 0 ? '1px solid var(--border-subtle)' : 'none',
                  borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <p className="text-[12px] font-semibold mb-0.5" style={{ color: 'hsl(var(--foreground) / 0.7)' }}>{label}</p>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground) / 0.9)' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

/** Detail panel for the Approver role — renders live data from _processed column C */
function LiveApproverPanel({ rec, px, mobile }: { rec: ApproverRecommendation; px: string; mobile: boolean }) {
  const r = rec.recommendation;
  const colorLower = (r?.color ?? '').toLowerCase();
  const isGo = colorLower === 'green';
  const isNoGo = colorLower === 'red';
  const s = rec.shipment ?? {};
  const svc = rec.selectedService ?? {};
  const ba = rec.budgetAnalysis ?? {};

  return (
    <div className={`flex-1 overflow-y-auto ${px} pb-4`}>
      {/* AI Recommendation — sticky label */}
      <div className="sticky top-0 z-10 flex items-center gap-3 pt-4 pb-3" style={{ background: 'hsl(var(--general-primary-foreground))' }}>
        <p className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: 'hsl(var(--foreground) / 0.6)' }}>AI Recommendation:</p>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${
            isGo
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/25 dark:text-emerald-300 dark:border-emerald-400/50'
              : isNoGo
                ? 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-500/25 dark:text-red-300 dark:border-red-400/50'
                : 'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-500/25 dark:text-amber-300 dark:border-amber-400/50'
          }`}
        >
          {isGo
            ? <CheckCircleIcon size={14} weight="fill" />
            : <WarningCircleIcon size={14} weight="fill" />}
          Accept
        </span>
      </div>

      <div className="flex flex-col gap-5">
      {/* Recommendation details */}
      <div className="rounded-xl p-[1px]" style={{ background: 'linear-gradient(135deg, #3B82F6, #A855F7)' }}>
        <div className="rounded-xl p-3.5" style={{ background: 'hsl(var(--muted))' }}>
          <p className="text-sm leading-snug" style={{ color: 'hsl(var(--foreground) / 0.85)' }}>
            {r?.summary ?? ''}
          </p>
          {r?.approvalLevel && (
            <p className="text-xs mt-2" style={{ color: 'hsl(var(--foreground) / 0.5)' }}>
              Required approval: {r.approvalLevel}
            </p>
          )}
        </div>
      </div>

      {/* Shipment Details */}
      <div>
        <SectionLabel>Shipment Details</SectionLabel>
        <FieldGrid rows={[
          { label: 'Item', value: s.itemDescription ?? '—' },
          { label: 'Requestor', value: `${s.requestedBy ?? '—'} · ${s.department ?? '—'}` },
          { label: 'Vendor', value: s.vendorName ?? '—' },
          { label: 'Venue', value: s.shipToVenue ?? '—' },
          { label: 'Quantity', value: String(s.quantity ?? '—') },
          { label: 'Weight', value: s.weightLbs ? `${s.weightLbs} lbs · ${s.numPackages} pkg` : '—' },
          { label: 'Requested ship date', value: s.requestedShipDate ? new Date(s.requestedShipDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
          { label: 'AP Coding', value: s.apCoding ?? '—' },
        ]} />
      </div>

      {/* Requestor Notes */}
      {s.notes && (
        <div>
          <SectionLabel>Requestor Notes</SectionLabel>
          <div
            className={`rounded-xl p-3.5 ${mobile ? 'text-[13px]' : 'text-sm'}`}
            style={{ background: 'hsl(var(--muted))', border: '1px solid var(--border-subtle)' }}
          >
            <p style={{ color: 'hsl(var(--foreground) / 0.85)' }}>{s.notes}</p>
          </div>
        </div>
      )}

      {/* Selected Service */}
      <div>
        <SectionLabel>Selected Shipping Service</SectionLabel>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border-subtle)', background: 'hsl(var(--muted))' }}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-3.5 py-3">
            <div>
              <p className="text-[12px] font-semibold mb-0.5" style={{ color: 'hsl(var(--foreground) / 0.7)' }}>Service</p>
              <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground) / 0.9)' }}>{svc.serviceName ?? '—'}</p>
            </div>
            <div>
              <p className="text-[12px] font-semibold mb-0.5" style={{ color: 'hsl(var(--foreground) / 0.7)' }}>Total Cost</p>
              <p className="text-base font-bold" style={{ color: 'hsl(var(--foreground))' }}>${fmt(svc.totalNetCharge)} {svc.currency ?? ''}</p>
            </div>
            <div>
              <p className="text-[12px] font-semibold mb-0.5" style={{ color: 'hsl(var(--foreground) / 0.7)' }}>Base + Surcharges</p>
              <p className="text-sm" style={{ color: 'hsl(var(--foreground) / 0.7)' }}>${fmt(svc.baseCharge)} + ${fmt(svc.surcharges)}</p>
            </div>
            <div>
              <p className="text-[12px] font-semibold mb-0.5" style={{ color: 'hsl(var(--foreground) / 0.7)' }}>Billed Weight</p>
              <p className="text-sm" style={{ color: 'hsl(var(--foreground) / 0.7)' }}>
                {svc.billedWeight ?? '—'} lbs {svc.ratedByDim ? '(DIM)' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Impact */}
      <div>
        <SectionLabel>Budget Impact</SectionLabel>
        <div
          className="rounded-xl overflow-hidden space-y-5 p-3.5"
          style={{ border: '1px solid var(--border-subtle)', background: 'hsl(var(--muted))' }}
        >
          {/* Event · Department · GL Code */}
          <div className="grid grid-cols-3 gap-x-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--foreground) / 0.45)' }}>Event</p>
              <p className="text-base font-bold" style={{ color: 'hsl(var(--foreground))' }}>{ba.eventName ?? '—'}</p>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--foreground) / 0.5)' }}>{ba.eventCode ?? ''}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--foreground) / 0.45)' }}>Department</p>
              <p className="text-base font-bold" style={{ color: 'hsl(var(--foreground))' }}>{ba.deptName ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--foreground) / 0.45)' }}>GL Code</p>
              <p className="text-base font-bold" style={{ color: 'hsl(var(--foreground))' }}>{ba.glCode ?? '—'}</p>
            </div>
          </div>

          {/* Department Budget bar */}
          {(() => {
            const pct = ba.utilization ?? 0;
            const total = ba.deptBudget ?? 0;
            const spent = total - (ba.remaining ?? 0);
            const remaining = ba.remaining ?? 0;
            return (
              <div>
                <div className="flex items-end justify-between mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--foreground) / 0.45)' }}>Department Budget</p>
                  <p className="text-xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>${fmt(total)}</p>
                </div>
                {/* Bar with floating badge */}
                <div className="relative mt-1 mb-3">
                  <div
                    className="absolute -top-6 z-10 px-2 py-0.5 rounded text-[10px] font-bold text-white"
                    style={{ left: `${Math.min(pct, 100)}%`, transform: 'translateX(-50%)', background: 'hsl(var(--foreground) / 0.85)' }}
                  >
                    {pct}% used
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'hsl(var(--foreground) / 0.1)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(pct, 100)}%`, background: 'linear-gradient(90deg, #14b8a6, #3b82f6)', transition: 'width 0.4s ease' }}
                    />
                  </div>
                </div>
                {/* Used / Remaining */}
                <div className="flex items-center justify-between">
                  <p>
                    <span className="text-base font-bold" style={{ color: '#14b8a6' }}>${fmt(spent)}</span>
                    <span className="text-xs ml-1" style={{ color: 'hsl(var(--foreground) / 0.45)' }}>used</span>
                  </p>
                  <p>
                    <span className="text-xs mr-1" style={{ color: 'hsl(var(--foreground) / 0.45)' }}>remaining</span>
                    <span className="text-base font-bold" style={{ color: 'hsl(var(--foreground))' }}>${fmt(remaining)}</span>
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      </div>
    </div>
  );
}

/** Detail panel for the Shipment Manager role — invoice review */
function ShipmentManagerPanel({ review, px, mobile }: { review: ReviewRequest; px: string; mobile: boolean }) {
  const d = review.invoiceReviewDetail!;
  const [notes, setNotes] = useState(d.shipmentNotes);
  const varianceColor = d.invoice.variance > 0 ? 'text-amber-400' : d.invoice.variance < 0 ? 'text-red-400' : 'text-foreground/70';
  const varianceSign = d.invoice.variance > 0 ? '+' : '';

  useEffect(() => {
    setNotes(d.shipmentNotes);
  }, [d.shipmentNotes]);

  return (
    <div className={`flex-1 overflow-y-auto ${px} py-4 flex flex-col gap-5`}>
      {/* Shipment Summary */}
      <div>
        <SectionLabel>Shipment Summary</SectionLabel>
        <FieldGrid rows={[
          { label: 'Item',        value: d.item },
          { label: 'Tracking',    value: d.tracking },
          { label: 'Event',       value: `${d.event.name} · ${d.event.customerId}` },
          { label: 'Requestor',   value: d.requestor },
          { label: 'Approved by', value: `${d.approvedBy.name} · ${d.approvedBy.date}` },
          { label: 'Delivered',   value: d.delivered },
        ]} />
      </div>

      {/* Invoice (Auto-matched) */}
      <div>
        <SectionLabel>Invoice (Auto-matched)</SectionLabel>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border-subtle)', background: 'hsl(var(--muted))' }}
        >
          <div className="grid grid-cols-4 px-3.5 py-2.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            {['Invoice #', 'Invoiced', 'Estimated', 'Variance'].map((h) => (
              <p key={h} className="text-[12px] font-semibold" style={{ color: 'hsl(var(--foreground) / 0.7)' }}>{h}</p>
            ))}
          </div>
          <div className="grid grid-cols-4 px-3.5 py-2.5">
            <p className={`text-sm font-medium ${mobile ? 'text-[12px]' : ''}`} style={{ color: 'hsl(var(--foreground) / 0.9)' }}>{d.invoice.number}</p>
            <p className={`text-sm font-medium ${mobile ? 'text-[12px]' : ''}`} style={{ color: 'hsl(var(--foreground) / 0.9)' }}>${fmt(d.invoice.invoiced)}</p>
            <p className={`text-sm font-medium ${mobile ? 'text-[12px]' : ''}`} style={{ color: 'hsl(var(--foreground) / 0.9)' }}>${fmt(d.invoice.estimated)}</p>
            <p className={`text-sm font-semibold ${varianceColor} ${mobile ? 'text-[12px]' : ''}`}>{varianceSign}${fmt(d.invoice.variance)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <a
            href={d.invoicePdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
          >
            <FileTextIcon size={13} />
            View invoice PDF
          </a>
          <span className="text-foreground/40 text-sm">·</span>
          <span className="text-sm" style={{ color: 'hsl(var(--foreground) / 0.5)' }}>Saved: {d.invoicePdfName}</span>
        </div>
      </div>

      {/* Shipment Notes */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <SectionLabel>Shipment Notes (Editable)</SectionLabel>
          <PencilSimpleIcon size={11} className="text-foreground/40 mb-[1px]" />
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-xl px-3.5 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          style={{
            background: 'hsl(var(--muted))',
            border: '1px solid var(--border-subtle)',
            color: 'hsl(var(--foreground) / 0.9)',
          }}
        />
      </div>

      {/* Draft AP Email */}
      <div>
        <SectionLabel>Draft AP Email</SectionLabel>
        <div
          className="rounded-xl overflow-hidden text-sm"
          style={{ border: '1px solid var(--border-subtle)', background: 'hsl(var(--muted))' }}
        >
          {/* Recipients */}
          <div
            className="px-3.5 py-2.5 flex flex-wrap gap-x-4 gap-y-1"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <span style={{ color: 'hsl(var(--foreground) / 0.55)' }}>To: <span style={{ color: 'hsl(var(--foreground) / 0.85)' }}>{d.apEmail.to}</span></span>
            <span style={{ color: 'hsl(var(--foreground) / 0.55)' }}>CC: <span style={{ color: 'hsl(var(--foreground) / 0.85)' }}>{d.apEmail.cc}</span></span>
          </div>
          {/* Body */}
          <div className="px-3.5 py-3 flex flex-col gap-1.5">
            {[
              { label: 'Vendor',        value: d.apEmail.vendor },
              { label: 'Subsidiary',    value: d.apEmail.subsidiary },
              { label: 'Department',    value: d.apEmail.department },
              { label: 'GL Code',       value: d.apEmail.glCode },
              { label: 'Customer Code', value: d.apEmail.customerCode },
              { label: 'Total',         value: `$${fmt(d.apEmail.total)}` },
              { label: 'Payment',       value: d.apEmail.payment },
              { label: 'Due',           value: d.apEmail.dueDate },
              { label: 'Invoice #',     value: d.apEmail.invoiceNumber },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-2">
                <span className="w-28 flex-shrink-0" style={{ color: 'hsl(var(--foreground) / 0.5)' }}>{label}:</span>
                <span style={{ color: 'hsl(var(--foreground) / 0.85)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Unified Sparta Parcel detail panel — renders Approver or Shipment Manager view based on review.spartaRole */
export default function SpartaParcelDetailPanel({ review, currentUser, width = 320, mobile = false, onBack, onClose, onApprove, onReject }: Props) {
  const isAssignedToMe = review.assignedTo.id === currentUser.id;
  const canAct = review.status === 'Pending' && isAssignedToMe;
  const px = mobile ? 'px-4' : 'px-5';
  const role = review.spartaRole;
  const hasLiveApprover = !!review.approverRecommendation;

  const title = role === 'approver'
    ? `Parcel shipment request — ${review.reqId}`
    : `Invoice review — ${review.reqId}`;

  const subtitle = role === 'approver'
    ? 'Notify & pause execution'
    : 'Review invoice, update notes, approve AP email';

  return (
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
      <div className={`${px} py-4 flex-shrink-0`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <h3 className="font-bold text-base leading-snug truncate" style={{ color: 'hsl(var(--foreground) / 0.8)' }}>
              {title}
            </h3>
            <div className="flex-shrink-0">
              <StatusBadge status={review.status} />
            </div>
          </div>
          {!mobile && onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 mt-0.5 p-1 rounded-md transition-colors hover:bg-muted"
              style={{ color: 'hsl(var(--foreground) / 0.5)' }}
            >
              <XIcon size={16} weight="bold" />
            </button>
          )}
        </div>
        <p className="text-xs mt-1.5" style={{ color: 'hsl(var(--foreground) / 0.55)' }}>{subtitle}</p>
      </div>

      {/* Scrollable content — role-specific */}
      {role === 'approver' && hasLiveApprover ? (
        <LiveApproverPanel rec={review.approverRecommendation!} px={px} mobile={mobile} />
      ) : role === 'approver' && review.parcelShipmentDetail ? (
        <ApproverPanel review={review} px={px} mobile={mobile} />
      ) : role === 'shipment-manager' && review.invoiceReviewDetail ? (
        <ShipmentManagerPanel review={review} px={px} mobile={mobile} />
      ) : null}

      {/* Footer */}
      <div
        className={`flex-shrink-0 ${mobile ? 'px-4 pt-3 pb-6' : 'px-5 pt-3 pb-4'}`}
        style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-muted-50)' }}
      >
        {canAct && role === 'approver' ? (
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => onReject?.(review)}
              className={`flex-shrink flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-colors ${mobile ? 'text-[13px]' : 'text-sm'} hover:bg-red-100 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-500/20 dark:hover:text-red-300 dark:hover:border-red-400/50`}
              style={{ background: 'hsl(var(--muted))', border: '1px solid var(--border-subtle)', color: 'hsl(var(--foreground) / 0.8)', width: 200, minWidth: 100 }}
            >
              <XIcon size={16} weight="bold" />
              Reject
            </button>
            <button
              onClick={() => onApprove?.(review)}
              className={`flex-shrink flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-colors ${mobile ? 'text-[13px]' : 'text-sm'} bg-purple-accent hover:bg-purple-accent/85 text-white`}
              style={{ width: 200, minWidth: 100 }}
            >
              <CheckIcon size={16} weight="bold" />
              Accept
            </button>
          </div>
        ) : canAct && role === 'shipment-manager' ? (
          <div className="flex items-center justify-end gap-3">
            <button
              className={`flex-shrink flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-colors ${mobile ? 'text-[13px]' : 'text-sm'} hover:bg-red-100 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-500/20 dark:hover:text-red-300 dark:hover:border-red-400/50`}
              style={{ background: 'hsl(var(--muted))', border: '1px solid var(--border-subtle)', color: 'hsl(var(--foreground) / 0.8)', width: 200, minWidth: 100 }}
            >
              <FlagIcon size={16} weight="bold" />
              Flag for review
            </button>
            <button
              className={`flex-shrink flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-colors ${mobile ? 'text-[13px]' : 'text-sm'} bg-purple-accent hover:bg-purple-accent/85 text-white`}
              style={{ width: 200, minWidth: 100 }}
            >
              <CheckIcon size={16} weight="bold" />
              Send to AP
            </button>
          </div>
        ) : (
          <div
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg ${mobile ? 'text-[13px]' : 'text-sm'}`}
            style={{ background: 'hsl(var(--popover))', color: 'hsl(var(--foreground) / 0.6)' }}
          >
            No action required
          </div>
        )}
      </div>
    </div>
  );
}
