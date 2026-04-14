import ConnectionDots from "@/components/common/ConnectionDots";

import { TypeToIcon } from "@/modules/flow/components/utils/TypeToIcon";

export default function AzureOutputs() {
  return (
    <div className="pt-2 flex flex-col gap-2">
      {[{ key: "attachment", type: "File" }].map((o) => (
        <div className="flex flex-col px-1 py-0.5" key={o.key}>
          <div className="flex items-center space-between gap-2">
            <span className="text-sm text-muted-foreground leading-5 truncate">{o.key}</span>
            <ConnectionDots />
            <TypeToIcon type={o.type as any} />
          </div>
          <span className="text-xs text-muted-foreground/50">{o.type}</span>
        </div>
      ))}
    </div>
  );
}
