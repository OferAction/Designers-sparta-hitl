import { useRef, useLayoutEffect } from "react";

import { Header, Row } from "@tanstack/react-table";

import { HeaderCell } from "./HeaderCell";
import { RowCell } from "../evaluationTable/RowCell";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils";

interface GroupColumnProps<T> {
  className?: string;
  groupId: string;
  groupIndex: number;
  totalGroups: number;
  headers: Header<T, unknown>[];
  rows: Row<T>[];
  globalFilter?: string;
  onScroll?: (scrollTop: number, initiatorId: string) => void;
  scrollTop?: number;
  scrollInitiatorId?: string;
  isLoading?: boolean;
  tableRef: React.RefObject<HTMLDivElement>;
}

export const EvaluationTableGroupColumn = <T,>({
  className,
  groupId,
  headers,
  rows,
  globalFilter,
  onScroll,
  scrollTop,
  scrollInitiatorId,
  isLoading = false,
  tableRef,
}: GroupColumnProps<T>) => {


  const handleColumnHover = (columnId: string | null) => {
    if (columnId) {
      tableRef?.current?.querySelectorAll(`[data-column-id="${columnId}"]`).forEach((el) => {
        el.setAttribute("data-column-hovered", "true");
      });
    } else {
      tableRef?.current?.querySelectorAll('[data-column-hovered="true"]').forEach((el) => {
        el.setAttribute("data-column-hovered", "false");
      });
    }
  };

  const handleRowHover = (rowId: string | null) => {
    if (rowId) {
      tableRef?.current?.querySelectorAll(`[data-row-id="${rowId}"]`).forEach((el) => {
        el.setAttribute("data-row-hovered", "true");
      });
    } else {
      tableRef?.current?.querySelectorAll('[data-row-hovered="true"]').forEach((el) => {
        el.setAttribute("data-row-hovered", "false");
      });
    }
  };
  const contentWidth = headers.reduce((sum, header) => sum + header.column.getSize(), 0);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isExternalScrollRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  // Sync scroll position when updated from another group
  useLayoutEffect(() => {
    if (scrollTop !== undefined && scrollInitiatorId !== groupId && scrollContainerRef.current) {
      isExternalScrollRef.current = true;

      // Cancel any pending animation frame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Use requestAnimationFrame for smooth scroll sync
      rafIdRef.current = requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollTop;
        }

        // Reset flag on next frame
        rafIdRef.current = requestAnimationFrame(() => {
          isExternalScrollRef.current = false;
          rafIdRef.current = null;
        });
      });
    }

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [scrollTop, scrollInitiatorId, groupId]);

  useLayoutEffect(() => {
    const scrollContainerElement = scrollContainerRef.current;
    if (!scrollContainerElement) return;

    const handleResize = () => {
      const hoverDivElement = hoverDivRef.current;
      if (hoverDivElement) {
        hoverDivElement.style.height = `${scrollContainerElement.scrollHeight}px`;
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(scrollContainerElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [rows]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!isExternalScrollRef.current && onScroll) {
      onScroll(e.currentTarget.scrollTop, groupId);
    }
  };

  return (
    <div className={cn("group/table self-stretch w-full rounded-md border-border/40 h-full", className)} data-group-column-id={groupId}>
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent group-hover/table:scrollbar-thumb-border h-full"
      >
        <div
          ref={hoverDivRef}
          className="absolute inset-0 w-full flex pointer-events-none -z-10 overflow-x-auto"
          style={{ minWidth: `${contentWidth}px` }}
        >
          {headers.map((header) => {
            const columnWidth = header.column.getSize();
            return (
              <div
                key={`overlay-${header.id}`}
                className="h-full flex-1 transition-colors data-[column-hovered=true]:bg-muted/40"
                style={{ minWidth: `${columnWidth}px` }}
                data-column-id={header.column.id}
              />
            );
          })}
        </div>
        {/* Header */}
        <div className="flex bg-background z-10 sticky top-0">
          {headers.map((header) => (
            <HeaderCell key={header.id} header={header} onColumnHover={handleColumnHover} />
          ))}
        </div>
        <div className="h-full pb-2">
          {/* Body Rows */}
          {isLoading
            ? // Skeleton loader rows
              Array.from({ length: 10 }).map((_, idx) => (
                <div key={`skeleton-${idx}`} className="flex h-9 text-xs">
                  {headers.map((header) => (
                    <div
                      key={`skeleton-cell-${header.id}-${idx}`}
                      className="flex items-center px-2 py-1.5 border-b border-border/40"
                      style={{ width: `${header.column.getSize()}px` }}
                    >
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ))
            : rows.map((row) => {
                const visibleCells = row.getVisibleCells();
                const cells = visibleCells.filter((cell) => {
                  const columnIds = headers.map((h) => h.column.id);
                  return columnIds.includes(cell.column.id);
                });

                return (
                  <div
                    key={row.id}
                    className="group/tableRow flex h-9 text-xs text-muted-foreground transition-colors data-[row-hovered=true]:bg-muted/40 data-[row-hovered=true]:text-foreground"
                    data-row-id={row.id}
                    onMouseEnter={() => handleRowHover(row.id)}
                    onMouseLeave={() => handleRowHover(null)}
                  >
                    {cells.map((cell) => (
                      <RowCell key={cell.id} cell={cell} globalFilter={globalFilter} />
                    ))}
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
};
