import type { Meta, StoryObj } from "@storybook/react";
import { PulseIcon as Activity, UsersIcon as Users, CurrencyDollarIcon as DollarSign, TrendUpIcon as TrendingUp, WarningCircleIcon as AlertCircle } from "@phosphor-icons/react";

import KPICard from "./KPICard";
import { Badge } from "@/components/ui/badge";

const meta: Meta<typeof KPICard> = {
  title: "HQ/KPICard",
  component: KPICard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof KPICard>;

export const Default: Story = {
  args: {
    label: "Total Runs",
    value: "12,480",
    subtext: "Last 30 days",
  },
};

export const WithIcon: Story = {
  args: {
    label: "Total Runs",
    value: "12,480",
    subtext: "Last 30 days",
    icon: Activity,
  },
};

export const WithExtra: Story = {
  args: {
    label: "Success Rate",
    value: "94.2%",
    subtext: "+2.1% from last month",
    icon: TrendingUp,
    extra: <Badge variant="outline" className="text-emerald-400 border-emerald-500/25">On track</Badge>,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-2xl">
      <KPICard label="Total Runs" value="12,480" subtext="Last 30 days" icon={Activity} />
      <KPICard label="Active Users" value="3,241" subtext="Currently online: 142" icon={Users} />
      <KPICard label="Revenue" value="$84,320" subtext="+12% vs last month" icon={DollarSign} />
      <KPICard label="Fraud Detected" value="37" subtext="0.3% of total runs" icon={AlertCircle} />
    </div>
  ),
};
