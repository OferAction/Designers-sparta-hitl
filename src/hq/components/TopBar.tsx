import { CheckCircle2, AlertTriangle, ShieldAlert, Info, ClipboardList } from 'lucide-react';
import { BellIcon as Bell, SunIcon as Sun, MoonIcon as Moon, ListIcon as List, FunnelIcon as Funnel, XIcon as X, CheckIcon as Check, CaretDownIcon as ChevronDown } from "@phosphor-icons/react";
import { useHQTheme } from '@/hq/context';
import { useSearchParams } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { HQNotification, NotificationKind, SpartaRole } from '@/hq/types';
import { useIsMobile } from '@/hq/hooks/useIsMobile';
import logoDarkUrl from '@/assets/actionhq-logo-dark.svg';
import logoLightUrl from '@/assets/actionhq-logo-light.svg';
import spartanLogoDarkUrl from '@/assets/spartan-logo-darkmode.png';
import spartanLogoLightUrl from '@/assets/spartan-logo-lightmode.png';
import { workflowOverviews } from '@/hq/data/mockData';
import { useHQRole } from '@/hq/context';

const WORKFLOW_OPTIONS = [
  { value: 'all', label: 'All workflows' },
  ...workflowOverviews.map(wf => ({ value: wf.id, label: wf.name })),
];

const DATE_OPTIONS = [
  { value: '1d',    label: '1 Day' },
  { value: '7d',    label: 'Last 7 days' },
  { value: '30d',   label: 'Last 30 days' },
  { value: '3m',    label: 'Last 3 months' },
  { value: '12m',   label: 'Last 12 months' },
  { value: 'all',   label: 'All time' },
];

const ENV_FILTER_OPTIONS = [
  { value: 'live', label: 'Live' },
  { value: 'test', label: 'Test' },
];

const STATUS_FILTER_OPTIONS = [
  { value: 'Pending',   label: 'Pending' },
  { value: 'Approved',  label: 'Approved' },
  { value: 'Declined',  label: 'Declined' },
  { value: 'Timed out', label: 'Timed out' },
  { value: 'Handoff',   label: 'Handoff' },
];

const TRIGGER_CLS = 'h-9 w-auto bg-card border-border text-foreground hover:border-ring data-[state=open]:border-ring rounded-lg px-3.5 gap-2';
const ITEM_CLS    = 'text-foreground hover:bg-muted focus:bg-muted focus:text-foreground px-3.5 py-2.5';

/** Reusable dropdown bound to URL search params */
function HQDropdown({
  options,
  paramKey,
  defaultValue,
  maxWidth,
}: {
  options: { value: string; label: string }[];
  paramKey: string;
  defaultValue: string;
  maxWidth?: string;
}) {
  const [params, setParams] = useSearchParams();
  const selected = params.get(paramKey) ?? defaultValue;

  /** Updates the URL search param on selection change */
  function handleChange(value: string) {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === defaultValue) next.delete(paramKey);
      else next.set(paramKey, value);
      return next;
    });
  }

  return (
    <Select value={selected} onValueChange={handleChange}>
      <SelectTrigger className={TRIGGER_CLS} style={maxWidth ? { maxWidth } : undefined}>
        <SelectValue className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" />
      </SelectTrigger>
      <SelectContent className="w-[260px] min-w-[260px] bg-card border-border rounded-xl">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} checkItem className={ITEM_CLS}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const KIND_ICON: Record<NotificationKind, React.ReactNode> = {
  review:  <ClipboardList size={14} />,
  fraud:   <ShieldAlert  size={14} />,
  success: <CheckCircle2 size={14} />,
  warning: <AlertTriangle size={14} />,
  system:  <Info          size={14} />,
};

const KIND_COLOR: Record<NotificationKind, string> = {
  review:  'text-muted-foreground bg-accent',
  fraud:   'text-red-500 bg-red-500/10',
  success: 'text-emerald-500 bg-emerald-500/10',
  warning: 'text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10',
  system:  'text-ring bg-popover',
};

/** Renders the notifications dropdown panel */
function NotificationsPanel({ notifications }: { notifications: HQNotification[] }) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div
      className="absolute right-0 top-full mt-2 w-[360px] rounded-xl border border-ring bg-card shadow-lg z-50 overflow-hidden"
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-semibold text-foreground">Notifications</span>
        {unread > 0 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent text-foreground">
            {unread} new
          </span>
        )}
      </div>
      <ul className="max-h-[420px] overflow-y-auto divide-y divide-border">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`flex gap-3 px-4 py-3 transition-colors hover:bg-muted ${!n.read ? 'bg-popover' : ''}`}
          >
            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${KIND_COLOR[n.kind]}`}>
              {KIND_ICON[n.kind]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-medium leading-snug ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {n.title}
                </p>
                {!n.read && <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />}
              </div>
              <p className="text-xs text-ring mt-0.5 leading-snug">{n.description}</p>
              <p className="text-xs text-ring mt-1">{n.timestamp}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="px-4 py-2.5 border-t border-border text-center">
        <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          Mark all as read
        </button>
      </div>
    </div>
  );
}

// Suppress unused references
void NotificationsPanel;
void KIND_ICON;
void KIND_COLOR;

/** Chip toggle for multi-select filter sections */
function FilterChips({ options, selected, onChange }: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  /** Toggles a chip on or off */
  function toggle(value: string) {
    if (selected.includes(value)) {
      const next = selected.filter((v) => v !== value);
      // Prevent deselecting all — keep at least one
      if (next.length > 0) onChange(next);
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              active
                ? 'bg-foreground/10 text-foreground border-foreground/20'
                : 'bg-transparent text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            {opt.label}
            {active && <Check size={11} weight="bold" />}
          </button>
        );
      })}
    </div>
  );
}

/** Full-screen mobile filter dialog with workflow, date, environment, and status */
function MobileFilterDialog({ onClose }: { onClose: () => void }) {
  const [params, setParams] = useSearchParams();

  const workflow = params.get('workflow') ?? 'all';
  const date = params.get('date') ?? '30d';
  const envRaw = params.get('env');
  const statusRaw = params.get('status');

  const [envSelected, setEnvSelected] = useState<string[]>(
    envRaw ? envRaw.split(',') : ENV_FILTER_OPTIONS.map((o) => o.value)
  );
  const [statusSelected, setStatusSelected] = useState<string[]>(
    statusRaw ? statusRaw.split(',') : STATUS_FILTER_OPTIONS.map((o) => o.value)
  );

  /** Applies filter selections to URL params and closes */
  function handleApply() {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      // Env
      const allEnv = envSelected.length === ENV_FILTER_OPTIONS.length;
      if (allEnv) next.delete('env');
      else next.set('env', envSelected.join(','));
      // Status
      const allStatus = statusSelected.length === STATUS_FILTER_OPTIONS.length;
      if (allStatus) next.delete('status');
      else next.set('status', statusSelected.join(','));
      return next;
    });
    onClose();
  }

  /** Resets all filters to defaults */
  function handleReset() {
    setEnvSelected(ENV_FILTER_OPTIONS.map((o) => o.value));
    setStatusSelected(STATUS_FILTER_OPTIONS.map((o) => o.value));
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('workflow');
      next.delete('date');
      next.delete('env');
      next.delete('status');
      return next;
    });
    onClose();
  }

  const activeCount =
    (workflow !== 'all' ? 1 : 0) +
    (date !== '30d' ? 1 : 0) +
    (envSelected.length < ENV_FILTER_OPTIONS.length ? 1 : 0) +
    (statusSelected.length < STATUS_FILTER_OPTIONS.length ? 1 : 0);

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col hq-layout bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="flex items-center gap-2">
          <Funnel size={16} className="text-foreground" />
          <span className="text-sm font-semibold text-foreground">Filters</span>
          {activeCount > 0 && (
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-purple-accent text-purple-accent-foreground">
              {activeCount}
            </span>
          )}
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
        {/* Workflow */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Workflow</label>
          <HQDropdown options={WORKFLOW_OPTIONS} paramKey="workflow" defaultValue="sparta-parcel" />
        </div>

        {/* Environment */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Environment</label>
          <FilterChips options={ENV_FILTER_OPTIONS} selected={envSelected} onChange={setEnvSelected} />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Status</label>
          <FilterChips options={STATUS_FILTER_OPTIONS} selected={statusSelected} onChange={setStatusSelected} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 pb-6" style={{ borderTop: '1px solid hsl(var(--border))' }}>
        <button
          onClick={handleReset}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium text-muted-foreground border border-border hover:text-foreground transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-purple-accent text-purple-accent-foreground hover:bg-purple-accent-hover transition-colors"
        >
          Apply filters
        </button>
      </div>
    </div>,
    document.body
  );
}

interface TopBarProps {
  onMenuOpen?: () => void;
}

/** Top bar — desktop shows dropdowns + actions; mobile shows hamburger, logo, filter button */
export default function HQTopBar({ onMenuOpen }: TopBarProps) {
  const { theme, toggle } = useHQTheme();
  const { roleFilter, setRoleFilter } = useHQRole();
  const ROLE_INITIALS: Record<SpartaRole, string> = { approver: 'AP', 'shipment-manager': 'SM', requester: 'RE' };
  const ROLE_LABELS: Record<SpartaRole, string> = { approver: 'Approver', 'shipment-manager': 'Shipment Manager', requester: 'Requester' };
  const ROLE_COLORS: Record<SpartaRole, string> = { approver: '#2563EB', 'shipment-manager': '#374151', requester: '#16A34A' };
  const ROLE_LIST: SpartaRole[] = ['approver', 'shipment-manager', 'requester'];
  const avatarInitials = ROLE_INITIALS[roleFilter];
  const avatarColor = ROLE_COLORS[roleFilter];
  const [notifOpen, setNotifOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    /** Closes notification panel on outside click */
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
    }
    if (notifOpen || roleMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen, roleMenuOpen]);

  /* ── Mobile top bar ── */
  if (isMobile) {
    return (
      <>
        <div className="flex items-center justify-between px-3 h-12 bg-background flex-shrink-0 mt-2">
          {/* Logo + Hamburger */}
          <div className="flex items-center gap-2">
            <button
              onClick={onMenuOpen}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
            >
              <List size={20} />
            </button>
            <div className="w-[130px] flex items-center">
              <img
                src={theme === 'dark' ? logoDarkUrl : logoLightUrl}
                alt="ActionHQ"
                className="w-full h-auto"
              />
            </div>
            <img src={theme === 'dark' ? spartanLogoDarkUrl : spartanLogoLightUrl} alt="Spartan" style={{ height: '24px', width: 'auto', marginLeft: '12px', flexShrink: 0 }} />
          </div>

          {/* Filter + avatar */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
            >
              <Funnel size={18} />
            </button>
            <div ref={roleRef} className="relative group"
              onMouseEnter={() => setRoleMenuOpen(true)}
              onMouseLeave={() => setRoleMenuOpen(false)}
            >
              <div className="flex items-center gap-1 cursor-pointer rounded-full px-1 py-1 pr-0 group-hover:bg-muted transition-colors">
                <div
                  className="w-8 h-8 flex items-center justify-center rounded-full text-white text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: avatarColor }}
                >
                  {avatarInitials}
                </div>
                <ChevronDown size={12} weight="bold" className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
              </div>
              {roleMenuOpen && (
                <div className="absolute right-0 top-full pt-1 z-50">
                  <div className="w-[220px] rounded-xl border border-border bg-card shadow-lg p-1.5">
                  {ROLE_LIST.map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRoleFilter(r); setRoleMenuOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        roleFilter === r
                          ? 'bg-muted text-foreground font-medium'
                          : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full text-white text-[10px] font-semibold" style={{ backgroundColor: ROLE_COLORS[r] }}>{ROLE_INITIALS[r]}</span>
                        {ROLE_LABELS[r]}
                      </span>
                      {roleFilter === r && <span className="w-1.5 h-1.5 rounded-full bg-purple-accent flex-shrink-0" />}
                    </button>
                  ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {filterOpen && <MobileFilterDialog onClose={() => setFilterOpen(false)} />}
      </>
    );
  }

  /* ── Desktop top bar ── */
  return (
    <div className="flex items-center gap-3 px-6 h-12 bg-background mt-4">
      <img
        src={theme === 'dark' ? logoDarkUrl : logoLightUrl}
        alt="ActionHQ"
        style={{ height: '22px', width: 'auto', maxWidth: 'none', flexShrink: 0 }}
      />
      <img src={theme === 'dark' ? spartanLogoDarkUrl : spartanLogoLightUrl} alt="Spartan" style={{ height: '24px', width: 'auto', flexShrink: 0, marginLeft: '12px' }} />
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground/80">System health:</span>
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
      </div>
      <div className="w-px h-5 bg-border" />
      <HQDropdown options={WORKFLOW_OPTIONS} paramKey="workflow" defaultValue="sparta-parcel" maxWidth="190px" />
      <div className="w-px h-5 bg-border" />
      <HQDropdown options={DATE_OPTIONS} paramKey="date" defaultValue="30d" maxWidth="160px" />

      <div className="w-px h-5 bg-border" />

      <button
        onClick={toggle}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-popover transition-colors"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div ref={notifRef} className="relative">
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-ring hover:text-foreground hover:bg-popover transition-colors"
        >
          <Bell size={16} />
        </button>
      </div>

      <div ref={roleRef} className="relative group"
        onMouseEnter={() => setRoleMenuOpen(true)}
        onMouseLeave={() => setRoleMenuOpen(false)}
      >
        <div className="flex items-center gap-1 cursor-pointer rounded-full px-1 py-1 pr-0 group-hover:bg-muted transition-colors">
          <div
            className="w-9 h-9 flex items-center justify-center rounded-full text-white text-sm font-semibold flex-shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {avatarInitials}
          </div>
          <ChevronDown size={12} weight="bold" className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
        </div>
        {roleMenuOpen && (
          <div className="absolute right-0 top-full pt-1 z-50">
            <div className="w-[220px] rounded-xl border border-border bg-card shadow-lg p-1.5">
            {ROLE_LIST.map((r) => (
              <button
                key={r}
                onClick={() => { setRoleFilter(r); setRoleMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  roleFilter === r
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full text-white text-[10px] font-semibold" style={{ backgroundColor: ROLE_COLORS[r] }}>{ROLE_INITIALS[r]}</span>
                  {ROLE_LABELS[r]}
                </span>
                {roleFilter === r && <span className="w-1.5 h-1.5 rounded-full bg-purple-accent flex-shrink-0" />}
              </button>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
