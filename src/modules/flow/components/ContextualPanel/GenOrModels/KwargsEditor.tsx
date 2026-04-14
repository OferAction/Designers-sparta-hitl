import {
  Terminal,
  TerminalHeader,
  TerminalTitle,
  TerminalControls,
  ExpandButton,
  CopyButton,
  TerminalContent,
  TerminalEditor,
  TerminalCopyBadge,
} from "@/components/common/CodeTerminal";
import { SectionTitle } from "@/modules/flow/components/ContextualPanel/SectionTitle";

interface KwargsEditorProps {
  title?: string;
  value: string;
  onChange: (value: string) => void;
}

export const KwargsEditor = ({ title = "kwargs", value, onChange }: KwargsEditorProps) => {
  return (
    <Terminal variant="input" className="h-full flex flex-1 bg-slate border-none">
      <TerminalHeader className="relative flex items-center border-none">
        <TerminalTitle className="text-sm text-foreground">
          <SectionTitle title={title} />
        </TerminalTitle>
        <TerminalCopyBadge className="absolute -top-8 -right-3 bg-background px-3 py-1 font-normal text-popover-foreground border border-border" />
        <TerminalControls>
          <ExpandButton />
          <CopyButton value={value} />
        </TerminalControls>
      </TerminalHeader>
      <TerminalContent>
        <TerminalEditor
          onChange={onChange}
          className="h-[200px] rounded-md border-input border overflow-hidden"
          language="json"
          value={value}
          options={{
            minimap: { enabled: false },
          }}
        />
      </TerminalContent>
    </Terminal>
  );
};
