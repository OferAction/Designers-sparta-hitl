import { ConfigureTab } from "./ConfigureTab";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function RightPanelTabs() {

  return (
    <ScrollArea className="h-full flex-1 thin-scrollbar [&>div>div]:!block overflow-auto">
      <div className="mt-0">
        <ConfigureTab />
      </div>
    </ScrollArea>
  );
}
