import type { Meta, StoryObj } from "@storybook/react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid,
  Line, LineChart, XAxis, YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "./chart";

const meta: Meta = {
  title: "UI/Chart",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

// ── Bar chart ────────────────────────────────────────────────────────────────

const barData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];

const barConfig: ChartConfig = {
  desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
  mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
};

export const BarChartStory: Story = {
  name: "Bar Chart",
  render: () => (
    <ChartContainer config={barConfig} className="h-64 w-full">
      <BarChart data={barData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
};

// ── Line chart ───────────────────────────────────────────────────────────────

const lineData = [
  { month: "Jan", success: 120, failed: 10 },
  { month: "Feb", success: 200, failed: 18 },
  { month: "Mar", success: 180, failed: 12 },
  { month: "Apr", success: 250, failed: 5 },
  { month: "May", success: 300, failed: 8 },
  { month: "Jun", success: 270, failed: 15 },
];

const lineConfig: ChartConfig = {
  success: { label: "Success", color: "#22c55e" },
  failed: { label: "Failed", color: "#ef4444" },
};

export const LineChartStory: Story = {
  name: "Line Chart",
  render: () => (
    <ChartContainer config={lineConfig} className="h-64 w-full">
      <LineChart data={lineData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={36} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line type="monotone" dataKey="success" stroke="var(--color-success)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="failed" stroke="var(--color-failed)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  ),
};

// ── Area chart ───────────────────────────────────────────────────────────────

const areaConfig: ChartConfig = {
  success: { label: "Success", color: "#3b82f6" },
  failed: { label: "Failed", color: "#f97316" },
};

export const AreaChartStory: Story = {
  name: "Area Chart",
  render: () => (
    <ChartContainer config={areaConfig} className="h-64 w-full">
      <AreaChart data={lineData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area type="monotone" dataKey="success" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.2} />
        <Area type="monotone" dataKey="failed" stroke="var(--color-failed)" fill="var(--color-failed)" fillOpacity={0.2} />
      </AreaChart>
    </ChartContainer>
  ),
};
