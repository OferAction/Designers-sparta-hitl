import { useInfiniteScrollTrigger } from "@/hooks/useInfiniteScrollTrigger";

import { useWorkspaceStore } from "../../store";
import { CardGrid } from "../card/CardGrid";
import { EmptyState } from "../EmptyState";
import { FileCard, FileRow } from "../files";
import { WorkspaceTable } from "../WorkspaceTable";
import { TemplateItem } from "./TemplateItem";
import { LastCreatedItemProvider } from "@/modules/workspace/contexts";
import { useGetSubflowsPageQuery } from "@/services/subflowConfiguratinService";

export function TemplateListing() {
  const viewMode = useWorkspaceStore((state) => state.viewMode);
  const pageSize = 10;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useGetSubflowsPageQuery(pageSize);

  const files = (data?.pages || []).flatMap((page) => page?.[0]?.files || []);

  const { sentinelRef, canLoadMore } = useInfiniteScrollTrigger({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    itemsLength: files.length,
  });

  if (status === "success" && files.length === 0) {
    return <EmptyState viewType="template" />;
  }

  const [Listing, FileItemComponent] = viewMode === "CardView" ? [CardGrid, FileCard] : [WorkspaceTable, FileRow];
const sentinel = canLoadMore && <div ref={sentinelRef} aria-hidden="true" id="observer" className="w-full h-px" />;

  return (
    <>
      <Listing loading={status === "pending" || (files.length === 0 && isFetchingNextPage)}>
        {files.map((file) => (
          <LastCreatedItemProvider id={file.id} key={`file${file.id}`}>
            <TemplateItem file={file} component={FileItemComponent} isInsideSubflow={true} />
          </LastCreatedItemProvider>
        ))}
      </Listing>
      {sentinel}
    </>
  );
}
