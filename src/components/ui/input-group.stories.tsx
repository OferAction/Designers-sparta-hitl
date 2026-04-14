import type { Meta, StoryObj } from "@storybook/react";
import { MagnifyingGlassIcon as Search, EyeIcon as Eye, EyeSlashIcon as EyeOff, GlobeIcon as Globe } from "@phosphor-icons/react";
import { useState } from "react";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "./input-group";

const meta: Meta = {
  title: "UI/InputGroup",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const WithPrefix: Story = {
  render: () => (
    <div className="w-72">
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <InputGroupText>
            <Search />
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="Search…" />
      </InputGroup>
    </div>
  ),
};

export const WithSuffix: Story = {
  render: () => (
    <div className="w-72">
      <InputGroup>
        <InputGroupInput placeholder="0.00" type="number" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>USD</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const WithPrefixAndSuffix: Story = {
  render: () => (
    <div className="w-72">
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <InputGroupText>
            <Globe />
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>.io</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const PasswordToggle: Story = {
  render: () => {
    const [show, setShow] = useState(false);
    return (
      <div className="w-72">
        <InputGroup>
          <InputGroupInput type={show ? "text" : "password"} placeholder="Password" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={() => setShow((s) => !s)} aria-label="Toggle password">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    );
  },
};

export const BlockLabel: Story = {
  render: () => (
    <div className="w-72">
      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText>API endpoint</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="https://api.example.com" />
      </InputGroup>
    </div>
  ),
};
