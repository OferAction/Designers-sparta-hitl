import { Outlet, ScrollRestoration } from "react-router-dom";

import { DialogRoot } from "./DialogRoot";
import { DescriptionSessionProvider } from "@/contexts/DescriptionSessionContext";
import { SignalRProvider } from "@/lib/signalr";
import { RuleStatusListener } from "@/modules/flow/SystemExEx/RightPanelRules/shared/RuleStatusListener";

const RootLayout = () => {
  return (
    <SignalRProvider>
      <DescriptionSessionProvider>
        <RuleStatusListener />
        <DialogRoot />
        <ScrollRestoration />
        <Outlet />
      </DescriptionSessionProvider>
    </SignalRProvider>
  );
};

export default RootLayout;
