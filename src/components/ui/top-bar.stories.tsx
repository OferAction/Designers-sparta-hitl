import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { TopBar, type FlowItem, type TopBarMode } from "./top-bar";

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof TopBar> = {
  title: "UI/TopBar",
  component: TopBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    mode: {
      control: "select",
      options: ["workflow", "live"],
      description: "Workflow editing vs. Live monitoring mode",
    },
    isSaved: {
      control: "boolean",
      description: "Whether the current state is saved",
    },
    isRunning: {
      control: "boolean",
      description: "Whether a run is in progress",
    },
    fileName: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TopBar>;

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const FLOWS: FlowItem[] = [
  { id: "1", name: "Audit PO",         version: "V2.112" },
  { id: "2", name: "Invoice Flow",     version: "V1.034" },
  { id: "3", name: "Employee Onboard", version: "V3.001" },
];

const TAB_BADGES = { build: 3, evaluate: 12, inspect: 0, monitor: 5, canvas: 0 };

// ─── Interactive wrapper ──────────────────────────────────────────────────────
// Owns all state so every control in the TopBar actually works in Storybook.

function Interactive(initial: {
  mode?: TopBarMode;
  activeTab?: string;
  isSaved?: boolean;
  isRunning?: boolean;
  fileName?: string;
  showBadges?: boolean;
}) {
  const [mode,       setMode]       = useState<TopBarMode>(initial.mode ?? "workflow");
  const [activeTab,  setActiveTab]  = useState<string>(
    initial.activeTab ?? (initial.mode === "live" ? "monitor" : "build")
  );
  const [activeFlow, setActiveFlow] = useState<FlowItem>(FLOWS[0]);
  const [isSaved,    setIsSaved]    = useState(initial.isSaved ?? true);
  const [isRunning,  setIsRunning]  = useState(initial.isRunning ?? false);

  function handleModeChange(m: TopBarMode) {
    setMode(m);
    setActiveTab(m === "live" ? "monitor" : "build");
  }

  function handleRunClick() {
    setIsRunning((prev) => {
      if (!prev) {
        setIsSaved(false);
        setTimeout(() => setIsSaved(true), 2000);
      }
      return !prev;
    });
  }

  return (
    <TopBar
      fileName={initial.fileName ?? "toy_story"}
      mode={mode}
      activeTab={activeTab}
      activeFlow={activeFlow}
      availableFlows={FLOWS}
      isSaved={isSaved}
      isRunning={isRunning}
      tabBadges={initial.showBadges ? TAB_BADGES : undefined}
      onModeChange={handleModeChange}
      onTabChange={setActiveTab}
      onFlowChange={setActiveFlow}
      onRunClick={handleRunClick}
    />
  );
}

// ─── Stories ──────────────────────────────────────────────────────────────────

/** Default workflow mode — Build tab active, everything interactive. */
export const Default: Story = {
  render: () => <Interactive />,
};

/** Live / monitoring mode — tabs switch to Monitor + Canvas. */
export const LiveMode: Story = {
  render: () => <Interactive mode="live" />,
};

/** Tabs showing notification badge counts. */
export const WithBadges: Story = {
  render: () => <Interactive showBadges />,
};

/** Unsaved state — cloud icon pulses with "Saving…" label. */
export const Unsaved: Story = {
  render: () => <Interactive isSaved={false} />,
};

/** Run is in progress — the Run button becomes a red Stop button. */
export const Running: Story = {
  render: () => <Interactive isRunning={true} />,
};

/** Long file name truncates cleanly within its container. */
export const LongFileName: Story = {
  render: () => (
    <Interactive fileName="my_very_long_project_name_that_overflows" />
  ),
};

/**
 * Kitchen-sink: live mode + running + unsaved.
 * Demonstrates the most complex state of the component.
 */
export const FullState: Story = {
  render: () => (
    <Interactive
      mode="live"
      isRunning={true}
      isSaved={false}
      showBadges
    />
  ),
};
