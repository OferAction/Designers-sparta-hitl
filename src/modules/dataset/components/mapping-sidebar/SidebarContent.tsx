import { cn } from "@/utils/tw-clsx";

interface SidebarContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarContent = ({ children, className = "" }: SidebarContentProps) => {
  return <div className={cn("p-4 flex-1", className)}>{children}</div>;
};
