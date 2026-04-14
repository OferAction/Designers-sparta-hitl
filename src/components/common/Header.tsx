import { ReactNode, useEffect, useState } from "react";

import { CaretLeftIcon } from "@phosphor-icons/react";
import { useMatches, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
interface HeaderProps {
  subtitle?: string;
}

type HeaderMatch = {
  handle: {
    back: () => string;
    getTitle: (params: unknown) => string;
    action: ReactNode;
  };
};

export function Header({ subtitle }: HeaderProps) {
  const navigate = useNavigate();
  const params = useParams();
  const matches = useMatches();
  const [title, setTitle] = useState("Loading...");

  const { handle } = matches[matches.length - 1] as HeaderMatch;
  useEffect(() => {
    const fetchTitle = async () => {
      if (handle.getTitle) {
        setTitle("Loading...");
        const title = await handle.getTitle(params);
        setTitle(title);
      }
    };
    fetchTitle();
  }, [handle, params]);

  return (
    <>
      <header className="w-full border-sidebar-border border-b text-sidebar-accent-foreground py-2 px-11 min-h-16 flex items-center justify-between">
        <div className="flex w-full items-center justify-between">
          <div className="flex-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="absolute left-0.5 text-sidebar-foreground" />
              {handle?.back && (
                <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => navigate(handle.back())}>
                  <CaretLeftIcon className="size-4" />
                </Button>
              )}
              <h1 className="text-sm leading-none font-semibold">{title}</h1>
            </div>
            {handle?.action && <div className="flex items-stretch gap-2">{handle.action}</div>}
          </div>
        </div>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </header>
    </>
  );
}
