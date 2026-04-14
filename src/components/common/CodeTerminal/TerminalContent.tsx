import { ReactNode } from "react";

interface TerminalContentProps {
  children: ReactNode;
}

export const TerminalContent = ({ children }: TerminalContentProps) => {
  return (
    <div className="relative h-full">
      <div className="transition-all duration-300 h-full">{children}</div>
    </div>
  );
};
