import { useCallback, useMemo, useState } from "react";

import { MagnifyingGlassIcon as Search } from "@phosphor-icons/react";

import LogTable from "./LogsTable";
import { CopyButton, Terminal, TerminalContent, TerminalControls, TerminalHeader } from "@/components/common/CodeTerminal";
import { Loader } from "@/components/common/Loader";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExecutionLogResponse } from "@/modules/flow/services/jobService/types";

const tabOrder = ["debug", "info", "warn", "error", "critical"];

interface LogsWrapperProps {
  data: ExecutionLogResponse;
  isLoading: boolean;
}

export function LogsWrapper({ data, isLoading }: LogsWrapperProps) {
  const [activeTab, setActiveTab] = useState("debug");
  const [searchQuery, setSearchQuery] = useState("");

  const isTabActive = useCallback(
    (tab: string) => {
      return tabOrder.indexOf(tab.toLowerCase()) >= tabOrder.indexOf(activeTab.toLowerCase());
    },
    [activeTab]
  );

  const filteredLogs = useMemo(() => {
    const all = data?.items || [];
    let filtered = activeTab === "debug" ? all : all.filter((log) => isTabActive(log.logLevel));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.message?.toLowerCase().includes(query) || log.logLevel?.toLowerCase().includes(query) || log.nodeId?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [data?.items, activeTab, isTabActive, searchQuery]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col bg-background h-full">
      <div className="flex-1 overflow-auto">
        {data?.items && data.items.length > 0 ? (
          <Terminal variant="input" className="h-full flex flex-col bg-background border-none">
            <Tabs value={activeTab} className="h-full flex flex-col">
              <TerminalHeader className="px-4 pt-2 pb-2 flex items-center justify-between border-none bg-background">
                <div className="flex items-center gap-2 flex-1">
                  <h3 className="text-sm mr-2 font-medium text-muted-foreground">Logs</h3>
                  <TabsList className="logsTabList h-10 bg-muted/50 [&>*]:rounded-none [&>*:first-child]:rounded-s-md [&>*:last-child]:rounded-e-md">
                    {tabOrder.map((tab) => (
                      <TabsTrigger
                        className="capitalize text-sm px-3 py-1 data-[state=active]:bg-background"
                        key={tab}
                        value={tab}
                        data-state={isTabActive(tab) ? "active" : ""}
                        onClick={() => handleTabClick(tab)}
                      >
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 w-48 pl-8 text-xs bg-background border-0 border-b rounded-none"
                    />
                  </div>
                  <TerminalControls>
                    <CopyButton value={filteredLogs} disabled={filteredLogs.length === 0} />
                  </TerminalControls>
                </div>
              </TerminalHeader>
              <TerminalContent>
                <div className="p-2.5 mb-2 overflow-auto flex-1 styled-scrollbar">
                  <TabsContent value={activeTab} className="mt-0">
                    <LogTable logs={filteredLogs} />
                  </TabsContent>
                  {isLoading && (
                    <div className="flex items-center justify-center min-h-[100px]">
                      <Loader />
                    </div>
                  )}
                </div>
              </TerminalContent>
            </Tabs>
          </Terminal>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No logs available</div>
        )}
      </div>
    </div>
  );
}
