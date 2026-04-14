import ConnectionDots from "@/components/common/ConnectionDots";

import { TypeToIcon } from "@/modules/flow/components/utils/TypeToIcon";

export default function OutlookOutputs() {
  return (
    <div className="pt-2 flex flex-col gap-2">
      {[
        { key: "body", type: "String" },
        { key: "attachments", type: "List of Files" },
      ].map((o) => (
        <div className="flex flex-col px-1 py-0.5" key={o.key}>
          <div className="flex items-center space-between gap-2">
            <span className="text-sm text-muted-foreground leading-5 truncate">{o.key}</span>
            <ConnectionDots />
            <TypeToIcon type={o.type} />
          </div>
          <span className="text-xs text-muted-foreground/50">{o.type}</span>
        </div>
      ))}
    </div>
  );
}
