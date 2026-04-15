import { useState, useEffect, type ReactNode } from 'react';

import {
  ArrowLeftIcon as ArrowLeft,
  CaretDownIcon as ChevronDown,
  CaretUpIcon as ChevronUp,
  CheckIcon,
  InfoIcon,
  PackageIcon,
  TruckIcon,
  WarningCircleIcon,
  XIcon,
} from '@phosphor-icons/react';

import StatusBadge from './StatusBadge';
import { ReviewRequest, Reviewer, ShippingOption } from '@/hq/types';

interface Props {
  review: ReviewRequest;
  currentUser: Reviewer;
  width?: number | string;
  mobile?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  onSubmit?: (review: ReviewRequest, selectedOption: ShippingOption) => void;
  onDiscard?: (review: ReviewRequest) => void;
}

/** Formats a number to 2 decimal places with commas */
function fmt(n: number | null | undefined) {
  if (n == null) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Formats an ISO date string to a readable format */
function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'hsl(var(--foreground) / 0.6)' }}>
      {children}
    </p>
  );
}

function FieldGrid({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      {rows.map(({ label, value }) => (
        <div key={label}>
          <p className="text-[11px] font-medium uppercase tracking-wide mb-0.5" style={{ color: 'hsl(var(--foreground) / 0.5)' }}>{label}</p>
          <p className="text-sm leading-snug" style={{ color: 'hsl(var(--foreground) / 0.9)' }}>{value}</p>
        </div>
      ))}
    </div>
  );
}

/** Renders a single shipping option card with selection state */
function ShippingOptionCard({
  option,
  isSelected,
  isRecommended,
  onSelect,
  mobile,
}: {
  option: ShippingOption;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
  mobile: boolean;
}) {
  const borderColor = isSelected
    ? 'border-purple-accent'
    : 'border-[var(--border-subtle)]';
  const bg = isSelected
    ? 'hsl(var(--purple-accent) / 0.06)'
    : 'hsl(var(--muted))';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl p-3.5 text-left transition-all border ${borderColor} ${mobile ? 'text-[13px]' : 'text-sm'}`}
      style={{ background: bg }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TruckIcon size={14} style={{ color: 'hsl(var(--foreground) / 0.6)' }} />
          <span className="font-semibold" style={{ color: 'hsl(var(--foreground) / 0.9)' }}>{option.serviceName}</span>
          {isRecommended && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-accent/15 text-purple-accent border border-purple-accent/25">
              Recommended
            </span>
          )}
        </div>
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            isSelected ? 'border-purple-accent bg-purple-accent' : 'border-[hsl(var(--ring))]'
          }`}
        >
          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-bold text-base" style={{ color: 'hsl(var(--foreground))' }}>
          ${fmt(option.totalNetCharge)} {option.currency}
        </span>
        {option.transitDays !== null && (
          <span style={{ color: 'hsl(var(--foreground) / 0.55)' }}>
            {option.transitDays} {option.transitDays === 1 ? 'day' : 'days'} transit
          </span>
        )}
        {option.transitDays === null && (
          <span style={{ color: 'hsl(var(--foreground) / 0.4)' }}>
            Transit N/A
          </span>
        )}
      </div>
      <div className="mt-1.5 flex gap-3" style={{ color: 'hsl(var(--foreground) / 0.45)' }}>
        <span>Base: ${fmt(option.totalBaseCharge)}</span>
        <span>Surcharges: ${fmt(option.totalSurcharges)}</span>
        <span>Fuel: ${fmt(option.fuelSurcharge)}</span>
      </div>
    </button>
  );
}

/** Detail panel for the Requester role — review proposed shipment from _processed sheet */
export default function RequesterDetailPanel({ review, currentUser, width = 320, mobile = false, onBack, onClose, onSubmit, onDiscard }: Props) {
  const d = review.requesterShipmentDetail;

  const [selectedOption, setSelectedOption] = useState<ShippingOption>(d?.selection?.selected ?? {} as ShippingOption);
  const [optionsExpanded, setOptionsExpanded] = useState((d?.selection?.allOptions?.length ?? 0) > 1);

  /* Reset selection when review changes */
  useEffect(() => {
    if (!d?.selection) return;
    setSelectedOption(d.selection.selected ?? {} as ShippingOption);
    setOptionsExpanded((d.selection.allOptions?.length ?? 0) > 1);
  }, [d]);

  if (!d) return null;

  const isAssignedToMe = review.assignedTo.id === currentUser.id;
  const canAct = review.status === 'Pending' && isAssignedToMe;
  const px = mobile ? 'px-4' : 'px-5';

  /** Handles submission — writes choice to column B of the sheet */
  function handleSubmit() {
    onSubmit?.(review, selectedOption);
  }

  /** Handles discard — records discard in column B */
  function handleDiscard() {
    onDiscard?.(review);
  }

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
              Shipment review — {review.reqId}
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
        <p className="text-xs mt-1.5" style={{ color: 'hsl(var(--foreground) / 0.55)' }}>
          Review proposed shipment and confirm or select an alternative
        </p>
      </div>

      {/* Scrollable content */}
      <div className={`flex-1 overflow-y-auto ${px} py-4 flex flex-col gap-5`}>
        {/* Request Info */}
        <div>
          <SectionLabel>Request Info</SectionLabel>
          <FieldGrid rows={[
            { label: 'Requested by', value: d.requestInfo.requestedBy },
            { label: 'Request date', value: fmtDate(d.requestInfo.requestDate) },
            { label: 'Submission ID', value: String(d.requestInfo.submissionId) },
          ]} />
          {d.requestInfo.notes && (
            <div
              className={`rounded-xl p-3.5 mt-3 ${mobile ? 'text-[13px]' : 'text-sm'}`}
              style={{ background: 'hsl(var(--muted))', border: '1px solid var(--border-subtle)' }}
            >
              <p style={{ color: 'hsl(var(--foreground) / 0.85)' }}>{d.requestInfo.notes}</p>
            </div>
          )}
        </div>

        {/* Item Details */}
        <div>
          <SectionLabel>Item Details</SectionLabel>
          <FieldGrid rows={[
            { label: 'Item', value: d.itemInfo.itemDescription },
            { label: 'Quantity', value: String(d.itemInfo.quantityBeingShipped) },
            { label: 'Department', value: d.itemInfo.department },
            { label: 'AP Coding', value: String(d.itemInfo.apCoding) },
          ]} />
        </div>

        {/* Ship From → Ship To */}
        <div>
          <SectionLabel>Shipping Route</SectionLabel>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)', background: 'hsl(var(--muted))' }}
          >
            <div className="px-3.5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'hsl(var(--foreground) / 0.5)' }}>Ship From</p>
              <p className="text-sm" style={{ color: 'hsl(var(--foreground) / 0.9)' }}>
                {d.shipFrom.vendorName} — {d.shipFrom.address}, {d.shipFrom.city}, {d.shipFrom.state} {d.shipFrom.zip}
              </p>
            </div>
            <div className="px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'hsl(var(--foreground) / 0.5)' }}>Ship To</p>
              <p className="text-sm" style={{ color: 'hsl(var(--foreground) / 0.9)' }}>
                {d.shipTo.venueName} ({d.shipTo.eventCode})
              </p>
              <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--foreground) / 0.6)' }}>
                POC: {d.shipTo.pocName} · {d.shipTo.pocPhone}
              </p>
            </div>
          </div>
        </div>

        {/* Package Info */}
        <div>
          <SectionLabel>Package Info</SectionLabel>
          <FieldGrid rows={[
            { label: 'Weight', value: `${d.packageInfo.weightLbs} lbs` },
            { label: 'Dimensions', value: `${d.packageInfo.lengthIn}×${d.packageInfo.widthIn}×${d.packageInfo.heightIn} in` },
            { label: 'Packages', value: String(d.packageInfo.numPackages) },
            { label: 'Requested method', value: d.packageInfo.method },
            { label: 'Ship by', value: fmtDate(d.packageInfo.requestedShipDate) },
          ]} />
        </div>

        {/* Proposed Shipment */}
        <div>
          <SectionLabel>Proposed Shipment</SectionLabel>
          <div
            className={`rounded-xl p-3.5 ${mobile ? 'text-[13px]' : 'text-sm'}`}
            style={{ background: 'hsl(var(--muted))', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <PackageIcon size={14} style={{ color: 'hsl(var(--foreground) / 0.6)' }} />
              <span className="font-semibold" style={{ color: 'hsl(var(--foreground) / 0.9)' }}>
                {d.selection?.selected?.serviceName ?? '—'}
              </span>
              <span className="font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                ${fmt(d.selection?.selected?.totalNetCharge)} {d.selection?.selected?.currency ?? ''}
              </span>
            </div>
            <p style={{ color: 'hsl(var(--foreground) / 0.65)' }}>{d.selection?.reason ?? ''}</p>
          </div>
        </div>

        {/* DIM Weight Note */}
        {d.dimWeightNote && (
          <div
            className={`rounded-xl p-3.5 flex items-start gap-2.5 ${mobile ? 'text-[13px]' : 'text-sm'}`}
            style={{ background: 'hsl(var(--muted))', border: '1px solid var(--border-subtle)' }}
          >
            <InfoIcon size={15} className="flex-shrink-0 mt-0.5" style={{ color: 'hsl(var(--foreground) / 0.5)' }} />
            <p style={{ color: 'hsl(var(--foreground) / 0.65)' }}>{d.dimWeightNote}</p>
          </div>
        )}

        {/* Warnings */}
        {d.hasWarnings && d.warnings.length > 0 && (
          <div>
            <SectionLabel>Warnings</SectionLabel>
            {d.warnings.map((w, i) => (
              <div
                key={i}
                className={`rounded-xl p-3.5 mb-2 flex items-start gap-2.5 ${mobile ? 'text-[13px]' : 'text-sm'}`}
                style={{ background: 'hsl(var(--destructive) / 0.08)', border: '1px solid hsl(var(--destructive) / 0.2)' }}
              >
                <WarningCircleIcon size={15} className="flex-shrink-0 mt-0.5 text-red-400" />
                <p style={{ color: 'hsl(var(--foreground) / 0.85)' }}>{w}</p>
              </div>
            ))}
          </div>
        )}

        {/* Choose shipping option */}
        {canAct && (d.selection?.allOptions?.length ?? 0) > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setOptionsExpanded(!optionsExpanded)}
              className="flex items-center gap-1.5 mb-3"
            >
              <SectionLabel>
                {(d.selection?.allOptions?.length ?? 0) > 1 ? 'Choose Shipping Option' : 'Shipping Option'}
              </SectionLabel>
              {(d.selection?.allOptions?.length ?? 0) > 1 && (
                optionsExpanded
                  ? <ChevronUp size={12} style={{ color: 'hsl(var(--foreground) / 0.5)' }} />
                  : <ChevronDown size={12} style={{ color: 'hsl(var(--foreground) / 0.5)' }} />
              )}
            </button>
            {optionsExpanded && (
              <div className="flex flex-col gap-2">
                {(d.selection?.allOptions ?? []).map((opt) => (
                  <ShippingOptionCard
                    key={opt.serviceType}
                    option={opt}
                    isSelected={selectedOption.serviceType === opt.serviceType}
                    isRecommended={opt.serviceType === d.selection?.selected?.serviceType}
                    onSelect={() => setSelectedOption(opt)}
                    mobile={mobile}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer — action buttons */}
      <div
        className={`flex-shrink-0 ${mobile ? 'px-4 pt-3 pb-6' : 'px-5 pt-3 pb-4'}`}
        style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-muted-50)' }}
      >
        {canAct ? (
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleDiscard}
              className={`flex-shrink flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-colors ${mobile ? 'text-[13px]' : 'text-sm'} hover:bg-red-100 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-500/20 dark:hover:text-red-300 dark:hover:border-red-400/50`}
              style={{ background: 'hsl(var(--muted))', border: '1px solid var(--border-subtle)', color: 'hsl(var(--foreground) / 0.8)', width: 200, minWidth: 100 }}
            >
              <XIcon size={16} weight="bold" />
              Discard
            </button>
            <button
              onClick={handleSubmit}
              className={`flex-shrink flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-colors ${mobile ? 'text-[13px]' : 'text-sm'} bg-purple-accent hover:bg-purple-accent/85 text-white`}
              style={{ width: 200, minWidth: 100 }}
            >
              <CheckIcon size={16} weight="bold" />
              Submit
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
