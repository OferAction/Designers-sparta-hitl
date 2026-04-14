import React, { useEffect, useLayoutEffect, useRef } from "react";

import { DownloadSimpleIcon } from "@phosphor-icons/react";

import { useFilePreview } from "@/hooks/useFilePreview";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Step1JsonlUploadProps {
  selectedFile: File | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadExample: () => void;
  validationError?: string | null;
  isValidating?: boolean;
}

export function Step1JsonlUpload({ selectedFile, onFileChange, onDownloadExample, validationError, isValidating }: Step1JsonlUploadProps) {
  const { lines, loadMore, loading, error, hasMore, bytesRead, fileSize } = useFilePreview(selectedFile, {
    linesPerBatch: 200,
    chunkSize: 64 * 1024,
    maxBytes: 10 * 1024 * 1024,
    autoStart: true,
  });

  // Intersection Observer to auto-load when near bottom
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // IntersectionObserver for vertical end detection
  useEffect(() => {
    const rootEl = containerRef.current;
    if (!sentinelRef.current || !rootEl) return;
    if (!hasMore || loading) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { root: rootEl, rootMargin: "200px 0px 200px 0px" }
    );
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, loadMore, lines.length]);

  // Dynamic sentinel width to match horizontal scrollable content width
  useLayoutEffect(() => {
    const container = containerRef.current;
    const sentinel = sentinelRef.current;
    if (!container || !sentinel) return;
    const setWidth = () => {
      sentinel.style.width = container.scrollWidth + "px";
    };
    setWidth();
    const ro = new ResizeObserver(setWidth);
    ro.observe(container);
    container.addEventListener("scroll", setWidth, { passive: true });
    return () => {
      ro.disconnect();
      container.removeEventListener("scroll", setWidth);
    };
  }, [lines.length]);

  return (
    <div className="flex-1 space-y-4 flex flex-col min-h-0">
      {/* File Upload Section */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="jsonl-upload" className="text-sm font-semibold text-foreground">
          1. Upload JSONL
        </Label>
        <div className="flex justify-between gap-4 pt-2">
          <div className="w-[348px] space-y-2">
            <div className="relative">
              <Input id="jsonl-upload" type="file" accept=".jsonl" onChange={onFileChange} className="hidden" />
              <label
                htmlFor="jsonl-upload"
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 border border-border rounded-md cursor-pointer",
                  "bg-background hover:bg-accent/50 transition-colors",
                  validationError && "border-destructive"
                )}
              >
                <span className="text-sm font-medium text-purple-400 truncate">Choose .JSONL file</span>
                <span className={cn("text-sm text-muted-foreground flex-1 truncate", selectedFile && "text-foreground")}>
                  {isValidating ? "Processing..." : selectedFile ? selectedFile.name : "No file chosen"}
                </span>
              </label>
            </div>
            {validationError && (
              <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md border border-destructive/30">{validationError}</div>
            )}
          </div>

          {/* Format Example */}
          <div className="flex-1 space-y-2">
            <div className="border border-border rounded-lg overflow-hidden bg-secondary/40">
              <div className="px-2 pt-2.5">
                <span className="text-xs font-semibold text-muted-foreground">Labels.jsonl format</span>
              </div>
              <div className="p-2.5">
                <code className="text-xs font-roboto-mono text-foreground leading-relaxed">
                  {`{"id":1, "category":"<Category>", "input_type":"<InputType>", "required":<true|false>, "default_value":"<DefaultValue>", "component":"<ComponentType>"}`}
                </code>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="link" size="sm" onClick={onDownloadExample} className="text-muted-foreground hover:text-foreground gap-1 px-0 h-auto">
                Download example file
                <DownloadSimpleIcon size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-4 pb-8 flex-1 flex flex-col min-h-0">
        <div>
          <h3 className="text-sm font-semibold text-foreground">*.JSONL file preview</h3>
        </div>
        <div className="border border-border rounded-lg h-full min-h-0 bg-secondary/30 flex flex-col relative">
          <div className="flex items-center justify-between px-2 py-1 border-b border-border text-[10px] text-muted-foreground font-roboto-mono gap-2 flex-wrap">
            {!selectedFile && <span className="opacity-70">No file</span>}
            {selectedFile && (
              <>
                <span>
                  {lines.length} line(s){!hasMore && selectedFile && bytesRead >= fileSize ? " (end)" : !hasMore ? " (stopped)" : ""}
                </span>
                <div className="flex gap-2 items-center ml-auto">
                  <span>{(bytesRead / 1024)?.toFixed(1)} KB read</span>
                  {hasMore && (
                    <Button variant="secondary" size="xs" onClick={loadMore} disabled={loading} className="h-5 px-2 text-[10px]">
                      {loading ? "Loading…" : "Load more"}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
          {error && <div className="px-2 py-1 text-[10px] text-destructive border-b border-border bg-background/60">{error}</div>}
          {/* Scroll Area */}
          <div ref={containerRef} className="flex-1 overflow-auto thin-scrollbar">
            {!selectedFile && (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-xs font-roboto-mono text-muted-foreground opacity-60">Upload file to show preview</p>
              </div>
            )}
            {selectedFile && (
              <div className="w-full font-roboto-mono text-foreground text-xs leading-relaxed">
                <div className="p-2 space-y-0">
                  {lines.length === 0 && !loading && !error && <span className="text-muted-foreground opacity-60">(File empty or not readable)</span>}
                  {lines.map((display, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-muted-foreground shrink-0 w-10 text-right select-none pr-1">{i + 1}</span>
                      <pre className="text-nowrap">{display}</pre>
                    </div>
                  ))}
                  {(loading || hasMore) && (
                    <div ref={sentinelRef} className="flex items-center gap-2 text-[10px] text-muted-foreground pt-2 min-w-full">
                      {loading ? "Loading…" : hasMore ? "Scroll / click load more for additional lines" : ""}
                    </div>
                  )}
                  {!hasMore && selectedFile && bytesRead < fileSize && (
                    <div className="text-[10px] text-muted-foreground pt-2">(Auto stop reached)</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
