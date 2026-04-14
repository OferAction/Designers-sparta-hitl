import { flagOptions, relevantMatchOptions } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { RegexClass } from "@/modules/flow/types";

type RelevantMatchOption = (typeof relevantMatchOptions)[number];
type FlagOption = (typeof flagOptions)[number];

type RegexAdvancedSettingsProps = {
  value?: Pick<RegexClass, "context_range" | "relevant_match" | "flags"> | null;
  onChange: (next: Partial<RegexClass>) => void;
};

const inputClasses = "w-32 h-7 bg-background border border-border rounded-md";

export function RegexAdvancedSettings({ value, onChange }: RegexAdvancedSettingsProps) {
  const handleContextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const parsed = Number(raw);
    onChange({ context_range: parsed });
  };

  const handleRelevantMatchChange = (next: RelevantMatchOption) => {
    onChange({ relevant_match: next });
  };

  const handleFlagsChange = (next: FlagOption) => {
    onChange({ flags: next });
  };

  return (
    <div className={cn("flex flex-col gap-3 pl-4")}>
      <div className="flex items-center gap-3">
        <Label htmlFor="regex-advanced-context-range" className="text-xs text-sidebar-foreground/70 w-28">
          Context range
        </Label>
        <Input
          id="regex-advanced-context-range"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          className={inputClasses}
          value={value?.context_range}
          onChange={handleContextChange}
          min={0}
        />
      </div>

      <div className={cn("flex items-center gap-3")}>
        <Label htmlFor="regex-advanced-relevant-match" className="text-xs text-sidebar-foreground/70 w-28">
          Relevant match
        </Label>
        <Select value={value?.relevant_match} onValueChange={(value) => handleRelevantMatchChange(value as RelevantMatchOption)}>
          <SelectTrigger id="regex-advanced-relevant-match" className={inputClasses}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {relevantMatchOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={cn("flex items-center gap-3")}>
        <Label htmlFor="regex-advanced-flags" className="text-xs text-sidebar-foreground/70 w-28">
          Flags
        </Label>
        <Select value={value?.flags} onValueChange={(value) => handleFlagsChange(value as FlagOption)}>
          <SelectTrigger id="regex-advanced-flags" className={inputClasses}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {flagOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default RegexAdvancedSettings;
