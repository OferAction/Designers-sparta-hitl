import type { Meta, StoryObj } from "@storybook/react";

import StatusBadge from "./StatusBadge";
import { HQThemeProvider } from "@/hq/context";

const meta: Meta<typeof StatusBadge> = {
  title: "HQ/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <HQThemeProvider>
        <Story />
      </HQThemeProvider>
    ),
  ],
  argTypes: {
    status: {
      control: "select",
      options: ["Pending", "Approved", "Declined", "Timed out", "Handoff", "Success", "Rerouted", "Failed"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Default: Story = {
  args: {
    status: "Pending",
  },
};

export const AllStatuses: Story = {
  render: () => (
    <HQThemeProvider>
      <div className="flex flex-wrap gap-3">
        <StatusBadge status="Pending" />
        <StatusBadge status="Approved" />
        <StatusBadge status="Declined" />
        <StatusBadge status="Timed out" />
        <StatusBadge status="Handoff" />
        <StatusBadge status="Success" />
        <StatusBadge status="Rerouted" />
        <StatusBadge status="Failed" />
      </div>
    </HQThemeProvider>
  ),
};
