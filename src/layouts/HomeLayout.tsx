import { CSSProperties, ReactNode, useState } from "react";

import { Header } from "@/components/common/Header";
import { ViewHeader } from "@/components/common/ViewHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowSidebar } from "@/modules/workspace/components/sidebar";
import { SearchProvider } from "@/modules/workspace/contexts";
import { cn } from "@/utils";

type TabType = "Subflow" | "Reliability Rules";

const ViewTemplateTab = ({ isTemplateList }: { isTemplateList?: boolean }) => {
  const [activeTab, setActiveTab] = useState<TabType>("Subflow");

  return (
    <>
      {isTemplateList && (
        <div className="pt-[calc(var(--header-height)+8px)] mx-auto">
          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={(value: string) => {
              setActiveTab(value as TabType);
            }}
            className="flex items-start"
          >
            <TabsList className="w-full flex items-center justify-start p-1 rounded-lg bg-secondary">
              <TabsTrigger
                value="Subflow"
                className="min-w-14 data-[state=active]:bg-background data-[state=active]:rounded-md px-3 py-1.5 text-sm font-medium"
              >
                Subflow
              </TabsTrigger>

              <TabsTrigger
                value="Reliability Rules"
                className="min-w-14 data-[state=active]:bg-background data-[state=active]:rounded-md px-3 py-1.5 text-sm font-medium"
              >
                Reliability Rules
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}
    </>
  );
};
export function HomeLayout({ children, isTemplateList }: { children: ReactNode; isTemplateList?: boolean }) {
  return (
    <div className="min-h-screen bg-background relative text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-[#1e293b] via-transparent to-slate-950 z-0" />

      {/* Red glow */}
      <div
        className="absolute w-[48rem] h-[48rem] top-[-50%] right-[10%] translate-x-[50%] rounded-full opacity-10 z-0 pointer-events-none"
        style={{ background: "#F43F5E", filter: "blur(200px)" }}
      />

      {/* Green glow */}
      <div
        className="absolute w-[25rem] h-[25rem] top-[10%] left-[-10%] opacity-10 z-0 pointer-events-none"
        style={{ background: "#5EEAD4", filter: "blur(200px)" }}
      />

      {/* Blue glow */}
      <div
        className="absolute w-[40em] h-[40rem] top-[40rem] left-[5rem]  opacity-10 z-0 pointer-events-none"
        style={{ background: "#3B82F6", filter: "blur(200px)" }}
      />

      {/* Purple glow */}
      <div
        className="absolute w-[38rem] h-[38rem] top-[40rem] translate-x-[50%] rounded-full right-0 opacity-10 z-0 pointer-events-none"
        style={{ background: "#A855F7", filter: "blur(200px)" }}
      />
      <SearchProvider>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "15rem",
              "--header-height": "4rem",
              "--view-header-height": "3rem",
            } as CSSProperties
          }
        >
          <WorkflowSidebar />
          <main className="flex-1 flex flex-col z-10 relative">
            <div className="fixed top-0 left-[var(--sidebar-width)] transition-[left] duration-200 ease-linear group-has-[[data-state=collapsed]]/sidebar-wrapper:left-[var(--sidebar-width-icon)] right-0 z-20 bg-background/80 backdrop-blur-sm">
              <Header subtitle="" />
            </div>
            <ViewTemplateTab isTemplateList={isTemplateList} />
            <div
              className={cn(
                "pt-[calc(var(--header-height))] top-[calc(var(--header-height)+var(--view-header-height))] left-[var(--sidebar-width)] right-0 z-10",
                {
                  "pt-0": isTemplateList,
                }
              )}
            >
              <ViewHeader />
            </div>
            {children}
          </main>
        </SidebarProvider>
      </SearchProvider>
    </div>
  );
}
