import DeduplicationAgentIterable from "./DeduplicationAgentIterable";
import DeduplicationAgentSettings from "./DeduplicationAgentSettings";

export default function () {
  return (
    <div className="flex flex-col gap-4">
      <DeduplicationAgentIterable />
      <DeduplicationAgentSettings />
    </div>
  );
}
