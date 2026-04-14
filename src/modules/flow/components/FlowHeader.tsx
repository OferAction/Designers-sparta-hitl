import { cn } from "@/utils";

function FlowHeader({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={cn("w-full flex [&>*]:pointer-events-auto p-4", className)}>{children}</div>;
}

export default FlowHeader;
