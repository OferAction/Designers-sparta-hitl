import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { MultiInput } from "./multi-input";

const meta: Meta<typeof MultiInput> = {
  title: "UI/MultiInput",
  component: MultiInput,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MultiInput>;

export const Default: Story = {
  render: () => {
    const [values, setValues] = useState<string[]>([]);
    return (
      <div className="w-80 space-y-1">
        <MultiInput onValueChange={setValues} placeholder="Type and press Enter" />
        {values.length > 0 && (
          <p className="text-xs text-muted-foreground">Values: {values.join(", ")}</p>
        )}
      </div>
    );
  },
};

export const WithPreselectedValues: Story = {
  render: () => {
    const [values, setValues] = useState<string[]>(["alpha", "beta", "gamma"]);
    return (
      <div className="w-80">
        <MultiInput defaultValue={values} onValueChange={setValues} />
      </div>
    );
  },
};

export const EmailValidation: Story = {
  render: () => {
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const [values, setValues] = useState<string[]>([]);
    return (
      <div className="w-80">
        <MultiInput
          onValueChange={setValues}
          validate={(v) => EMAIL_RE.test(v)}
          placeholder="Add email and press Enter"
        />
        {values.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">{values.length} valid email(s)</p>
        )}
      </div>
    );
  },
};

export const WithMaxItems: Story = {
  render: () => {
    const [values, setValues] = useState<string[]>(["one", "two"]);
    return (
      <div className="w-80 space-y-1">
        <MultiInput defaultValue={values} onValueChange={setValues} maxItems={3} />
        <p className="text-xs text-muted-foreground">Max 3 items</p>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-80">
      <MultiInput
        defaultValue={["read-only", "value"]}
        onValueChange={() => {}}
        disabled
      />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="w-80">
      <MultiInput
        defaultValue={["invalid"]}
        onValueChange={() => {}}
        error
        errorMessage="One or more values are invalid."
      />
    </div>
  ),
};
