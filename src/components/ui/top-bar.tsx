import * as React from "react";

import {
  CloudCheckIcon,
  StopIcon,
  CaretDownIcon,
  FlaskIcon,
  RocketIcon,
  PlusIcon,
  ShapesIcon,
  AnchorSimpleIcon,
  BinocularsIcon,
} from "@phosphor-icons/react";

import { BranchIcon, MonitorPulseIcon, CloudArrowUpIcon } from "@/lib/icons";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TopBarMode = "workflow" | "live";

export interface FlowItem {
  id: string;
  name: string;
  version: string;
}

interface TabDef {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface TopBarProps {
  fileName: string;
  mode: TopBarMode;
  activeTab: string;
  activeFlow: FlowItem;
  availableFlows: FlowItem[];
  isSaved: boolean;
  isRunning: boolean;
  /** Optional badge counts keyed by tab id */
  tabBadges?: Partial<Record<string, number>>;
  onModeChange: (mode: TopBarMode) => void;
  onTabChange: (tab: string) => void;
  onFlowChange: (flow: FlowItem) => void;
  onRunClick: () => void;
  onFlaskClick?: () => void;
  onRocketClick?: () => void;
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const WORKFLOW_TABS: TabDef[] = [
  { id: "build",    label: "Build",    icon: <ShapesIcon       size={16} /> },
  { id: "evaluate", label: "Evaluate", icon: <AnchorSimpleIcon  size={16} /> },
  { id: "inspect",  label: "Inspect",  icon: <BinocularsIcon    size={16} /> },
];

const LIVE_TABS: TabDef[] = [
  { id: "monitor", label: "Monitor", icon: <MonitorPulseIcon className="w-4 h-4 shrink-0" /> },
  { id: "canvas",  label: "Canvas",  icon: <BranchIcon        className="w-4 h-4 shrink-0" /> },
];

// ─── TopBar ───────────────────────────────────────────────────────────────────

export function TopBar({
  fileName,
  mode,
  activeTab,
  activeFlow,
  availableFlows,
  isSaved,
  isRunning,
  tabBadges,
  onModeChange,
  onTabChange,
  onFlowChange,
  onRunClick,
  onFlaskClick,
  onRocketClick,
}: TopBarProps) {
  const tabs = mode === "live" ? LIVE_TABS : WORKFLOW_TABS;

  return (
    <header className="flex items-center justify-between h-[52px] w-full bg-sidebar border-b border-sidebar-border shrink-0">

      {/* ── Left section ──────────────────────────────────────────────────────── */}
      <div className="flex items-center flex-1 min-w-0">

        {/* Logo slot */}
        <div className="flex items-center justify-center w-[52px] h-full shrink-0" />

        <div className="flex items-center gap-6">

          {/* File name dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center h-6 text-sm font-semibold text-foreground focus:outline-none">
                <span className="px-1 py-0.5 bg-secondary leading-none truncate max-w-[160px]">
                  {fileName}
                </span>
                <span className="flex items-center h-6 px-0.5 bg-secondary">
                  <CaretDownIcon size={8} />
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {availableFlows.map((flow) => (
                <DropdownMenuItem key={flow.id} onSelect={() => onFlowChange(flow)}>
                  {flow.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-4">

            {/* Mode toggle: Live / Workflow */}
            <div className="flex items-center gap-1">
              {(["live", "workflow"] as TopBarMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => onModeChange(m)}
                  className={cn(
                    "px-2 py-1.5 rounded-md bg-secondary text-sm font-medium transition-colors",
                    mode === m ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {m === "live" ? "Live" : "Workflow"}
                </button>
              ))}
            </div>

            {/* Flow selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 h-8 px-2 rounded-md border border-secondary/40 text-sm text-foreground hover:border-secondary transition-colors focus:outline-none">
                  <span className="font-medium truncate max-w-[120px]">{activeFlow.name}</span>
                  <span className="font-roboto-mono text-xs text-foreground/70 shrink-0">{activeFlow.version}</span>
                  <CaretDownIcon size={12} className="text-muted-foreground shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {availableFlows.map((flow) => (
                  <DropdownMenuItem key={flow.id} onSelect={() => onFlowChange(flow)}>
                    <span>{flow.name}</span>
                    <span className="ml-auto pl-4 font-roboto-mono text-xs text-muted-foreground">
                      {flow.version}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </div>

      {/* ── Center: navigation tabs ───────────────────────────────────────────── */}
      <div className="flex items-center h-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const badge = tabBadges?.[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-1 h-full px-4 text-sm transition-colors border-b",
                isActive
                  ? "border-foreground text-foreground font-semibold"
                  : "border-transparent text-foreground/70 font-normal hover:text-foreground/90"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {badge !== undefined && (
                <span className="flex items-center justify-center w-[17px] h-[17px] rounded bg-secondary text-[8.5px] font-semibold text-muted-foreground">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Right section ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-2 flex-1 justify-end shrink-0">

        {/* Save status */}
        <div className={cn("flex items-center gap-1.5 text-xs text-foreground/70", !isSaved && "animate-pulse")}>
          {isSaved
            ? <CloudCheckIcon size={16} />
            : <CloudArrowUpIcon className="w-4 h-4" />}
          <span>{isSaved ? "Saved" : "Saving…"}</span>
        </div>

        <div className="flex items-center gap-2">

          {/* Flask icon button */}
          <button
            onClick={onFlaskClick}
            className="flex items-center justify-center w-8 h-8 rounded-md text-foreground hover:bg-secondary transition-colors"
            aria-label="Test branch"
          >
            <FlaskIcon size={16} />
          </button>

          {/* Rocket icon button */}
          <button
            onClick={onRocketClick}
            className="flex items-center justify-center w-8 h-8 rounded-md text-foreground hover:bg-secondary transition-colors"
            aria-label="Deploy"
          >
            <RocketIcon size={16} />
          </button>

          {/* Run / Stop split button */}
          <button
            onClick={onRunClick}
            className={cn(
              "flex items-center gap-1 h-8 px-2 rounded-md text-sm font-medium transition-colors",
              isRunning
                ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            )}
          >
            {isRunning ? (
              <>
                <StopIcon size={16} />
                <span>Stop</span>
              </>
            ) : (
              <>
                <PlusIcon size={16} />
                <span>Run</span>
                <CaretDownIcon size={16} className="ml-0.5 text-muted-foreground" />
              </>
            )}
          </button>

        </div>
      </div>
    </header>
  );
}
