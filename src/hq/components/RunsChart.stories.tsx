import type { Meta, StoryObj } from "@storybook/react";

import RunsChart from "./RunsChart";
import { HQThemeProvider } from "@/hq/context";

const meta: Meta<typeof RunsChart> = {
  title: "HQ/RunsChart",
  component: RunsChart,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <HQThemeProvider>
        <div style={{ height: 360 }}>
          <Story />
        </div>
      </HQThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RunsChart>;

export const Default: Story = {};
