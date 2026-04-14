import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { HighlightedText } from "./HighlightedText";

const meta: Meta<typeof HighlightedText> = {
  title: "Common/HighlightedText",
  component: HighlightedText,
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text" },
    query: { control: "text" },
    highlightClassName: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof HighlightedText>;

export const Default: Story = {
  args: {
    text: "Invoice processing workflow",
    query: "workflow",
  },
};

export const NoMatch: Story = {
  args: {
    text: "Invoice processing workflow",
    query: "payment",
  },
};

export const NoQuery: Story = {
  args: {
    text: "Invoice processing workflow",
    query: "",
  },
};

export const CustomHighlight: Story = {
  args: {
    text: "Search result with a highlighted match",
    query: "highlighted",
    highlightClassName: "bg-yellow-300 text-yellow-900 rounded px-0.5",
  },
};

export const LiveSearch: Story = {
  render: () => {
    const [query, setQuery] = useState("");
    const items = [
      "Invoice processing workflow",
      "Customer data extraction",
      "Email classification pipeline",
      "Document summarization",
    ];
    return (
      <div className="space-y-3 w-80">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-full border border-border rounded px-2 py-1.5 text-sm bg-background outline-none focus:ring-1 focus:ring-ring"
        />
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item} className="text-sm px-2 py-1 rounded hover:bg-muted">
              <HighlightedText text={item} query={query} />
            </li>
          ))}
        </ul>
      </div>
    );
  },
};
