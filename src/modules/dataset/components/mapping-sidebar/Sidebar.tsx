import { cn } from "@/utils/tw-clsx";

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export const Sidebar = ({ children, className = "" }: SidebarProps) => {
  return <div className={cn("max-w-[29rem] min-w-[20rem] w-fit border-r bg-sidebar flex flex-col", className)}>{children}</div>;
};
