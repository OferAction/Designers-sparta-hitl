import type { Meta, StoryObj } from "@storybook/react";
import { CalculatorIcon as Calculator, CalendarBlankIcon as Calendar, CreditCardIcon as CreditCard, GearIcon as Settings, UserIcon as User } from "@phosphor-icons/react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command";

const meta: Meta = {
  title: "UI/Command",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="w-80 border border-border rounded-lg overflow-hidden">
      <Command>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </CommandItem>
            <CommandItem>
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Account">
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              Profile
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Calculator className="mr-2 h-4 w-4" />
              Calculator
              <CommandShortcut>⌘C</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};

export const WithClearButton: Story = {
  render: () => (
    <div className="w-80 border border-border rounded-lg overflow-hidden">
      <Command>
        <CommandInput
          placeholder="Search…"
          showClearButton
          onClear={() => {}}
        />
        <CommandList>
          <CommandGroup heading="Actions">
            <CommandItem>Create new workflow</CommandItem>
            <CommandItem>Import dataset</CommandItem>
            <CommandItem>Export results</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="w-80 border border-border rounded-lg overflow-hidden">
      <Command>
        <CommandInput placeholder="Search something rare…" defaultValue="zzzzz" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Items">
            <CommandItem>Item one</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};
