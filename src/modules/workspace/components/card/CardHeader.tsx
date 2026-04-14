import { EditableField } from "@/components/common/EditableField";
import { cn } from "@/utils";

import { TextHighlightPart } from "@/modules/workspace/utils/searchHighlight";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  children?: React.ReactNode;
  id?: string;
  highlightParts?: TextHighlightPart[];
}

export function CardHeader({ title, className, children, id, highlightParts, ...rest }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between min-w-0", className)} {...rest}>
      <EditableField currentValue={title} id={id} className="min-w-0 flex-1" highlightParts={highlightParts} />
      <div className="flex-shrink-0 ml-2">{children}</div>
    </div>
  );
}
