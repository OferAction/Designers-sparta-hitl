import type { Meta, StoryObj } from "@storybook/react";

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";

const meta: Meta = {
  title: "UI/Toast",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
        <ToastViewport />
      </ToastProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Toast open>
      <div className="grid gap-1">
        <ToastTitle>Scheduled: Catch up</ToastTitle>
        <ToastDescription>Friday, February 10, 2023 at 5:57 PM</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Toast open>
      <div className="grid gap-1">
        <ToastTitle>Undo action</ToastTitle>
        <ToastDescription>Your workflow was deleted.</ToastDescription>
      </div>
      <ToastAction altText="Undo">Undo</ToastAction>
      <ToastClose />
    </Toast>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Toast open variant="destructive">
      <div className="grid gap-1">
        <ToastTitle>Error</ToastTitle>
        <ToastDescription>Something went wrong. Please try again.</ToastDescription>
      </div>
      <ToastAction altText="Try again">Try again</ToastAction>
      <ToastClose />
    </Toast>
  ),
};

export const BothVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-sm">
      <Toast open>
        <div className="grid gap-1">
          <ToastTitle>Default Toast</ToastTitle>
          <ToastDescription>Your changes were saved successfully.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      <Toast open variant="destructive">
        <div className="grid gap-1">
          <ToastTitle>Destructive Toast</ToastTitle>
          <ToastDescription>Something went wrong.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
    </div>
  ),
};

export const Triggered: Story = {
  render: () => {
    // This story shows how a toast looks when triggered via the useToast hook
    // For interactive demo, see the Toaster component in your app
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Static preview of toast styles — in the app, toasts are triggered via the useToast hook.</p>
        <Toast open>
          <div className="grid gap-1">
            <ToastTitle>Workflow saved</ToastTitle>
            <ToastDescription>Your workflow has been saved.</ToastDescription>
          </div>
          <ToastAction altText="View">View</ToastAction>
          <ToastClose />
        </Toast>
      </div>
    );
  },
};
