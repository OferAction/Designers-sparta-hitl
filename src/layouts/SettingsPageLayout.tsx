import { ReactNode } from "react";

interface SettingsTabLayoutProps {
  title: string;
  children: ReactNode;
  buttonConfig?: ReactNode;
  subtitle?: string;
  subtitleClassName?: string;
}

// Shared layout wrapper for settings tabs
export const SettingsTabLayout = ({ title, children, buttonConfig, subtitle, subtitleClassName }: SettingsTabLayoutProps) => {
  return (
    <div className="h-full flex flex-col items-between gap-5">
      <div className="py-5 flex justify-between items-center border-b border-sidebar-border px-6">
        <div className="flex flex-col">
          <span className="text-white text-2xl leading-8">{title}</span>
          {subtitle && <p className={`text-sm text-muted-foreground ${subtitleClassName}`}>{subtitle}</p>}
        </div>
        {buttonConfig}
      </div>
      {children}
    </div>
  );
};

export default SettingsTabLayout;
