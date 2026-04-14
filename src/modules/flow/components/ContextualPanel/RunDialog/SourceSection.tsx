import { useState } from "react";

import { LoadFromDataset } from "./LoadFromDataset";
import { RecentSamplesSection } from "./RecentSamplesSection";
import { SourceFile } from "./SourceFile";
import { SourceSectionProps } from "./types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const SourceSection = ({ inputs, runScope, initialSource }: SourceSectionProps) => {
  const [source, setSource] = useState<string>(initialSource || "recent-samples");

  return (
    <div className="py-6 flex flex-col ">
      {runScope === "run-path" ? (
        <>
          <h2 className="text-xs text-sidebar-foreground/70 pb-3">Data source</h2>
          <Tabs value={source} onValueChange={setSource}>
            <TabsList>
              <TabsTrigger value="recent-samples">Recent Samples</TabsTrigger>
              <TabsTrigger value="from-dataset">From Dataset</TabsTrigger>
              <TabsTrigger value="file">File</TabsTrigger>
            </TabsList>
          </Tabs>
        </>
      ) : (
        <div>
          <span className="text-sidebar-foreground/70 pb-3">Recent Samples</span>
        </div>
      )}
      <div className="pt-2 max-h-[300px] overflow-y-auto styled-scrollbar overflow-hidden pr-2">
        {source === "file" && <SourceFile inputs={inputs} scope={runScope} />}
        {source === "recent-samples" && <RecentSamplesSection inputs={inputs} runScope={runScope} />}
        {source === "from-dataset" && <LoadFromDataset inputs={inputs} scope={runScope} />}
      </div>
    </div>
  );
};
