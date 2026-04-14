import React from "react";

import { cn } from "@/utils";

export interface RemoteUserInfo {
  name: string;
  color: string;
}

interface RemoteSelectionBadgeProps {
  users: RemoteUserInfo[];
  outlineColor?: string | undefined;
}

export const RemoteSelectionBadge: React.FC<RemoteSelectionBadgeProps> = ({ users, outlineColor }) => {
  const [open, setOpen] = React.useState(false);
  if (!users.length) return null;
  const first = users[0];
  const extra = users.length - 1;
  return (
    <div data-remote-selected data-thumbnail="hidden" className={cn("absolute top-0 -translate-y-[calc(100%+6px)] z-20 left-[18px] right-[18px]")}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((s) => !s);
        }}
        className={cn(
          "rounded-tab px-2 py-1.5 text-xs font-medium flex items-center gap-1 max-w-full",
          "focus:outline-none focus:ring-1 focus:ring-transparent"
        )}
        style={
          {
            background: outlineColor || first.color || "#444",
            "--r": "8px",
          } as React.CSSProperties
        }
        title={users.map((u) => u.name).join(", ")}
      >
        <span className="truncate" title={first.name}>
          {first.name}
        </span>
        {extra > 0 && <span className="text-[9px] opacity-90">+{extra}</span>}
      </button>
      {open && (
        <div
          className="absolute top-full right-0 mt-1 rounded-md bg-neutral-900/95 backdrop-blur px-2 py-2 shadow-lg border border-neutral-700 min-w-[140px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-300">Collaborators</span>
            <button
              type="button"
              className="text-neutral-400 hover:text-neutral-200 text-[9px]"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            >
              ✕
            </button>
          </div>
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {users.map((u, idx) => (
              <li key={idx} className="flex items-center gap-2 text-[10px]">
                <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: u.color }} />
                <span className="truncate" title={u.name}>
                  {u.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RemoteSelectionBadge;
