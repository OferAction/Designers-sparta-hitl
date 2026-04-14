import { useCallback, useEffect, useRef, useState } from "react";

export interface UseFilePreviewOptions {
  linesPerBatch?: number; // lines to attempt per incremental load
  chunkSize?: number; // bytes per slice read
  /** @deprecated Previously used for auto byte cap; no longer enforced. */
  maxBytes?: number; // kept for backward compat (ignored)
  autoStart?: boolean; // start automatically after file set
}

export interface UseFilePreviewReturn {
  lines: string[];
  loadMore: () => void;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  bytesRead: number;
  fileSize: number;
  reset: () => void;
  sessionId: number;
}

export function useFilePreview(file: File | null | undefined, opts: UseFilePreviewOptions = {}): UseFilePreviewReturn {
  const { linesPerBatch = 200, chunkSize = 64 * 1024, autoStart = true } = opts;

  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [bytesRead, setBytesRead] = useState(0);
  const [sessionId, setSessionId] = useState(0);

  const offsetRef = useRef(0);
  const remainderRef = useRef("");
  const readingRef = useRef(false);

  const reset = useCallback(() => {
    setLines([]);
    setError(null);
    setLoading(false);
    setHasMore(false);
    setBytesRead(0);
    offsetRef.current = 0;
    remainderRef.current = "";
    readingRef.current = false;
    setSessionId(Date.now());
  }, []);

  useEffect(() => {
    reset();
    if (file && autoStart) setHasMore(true);
  }, [file, reset, autoStart]);

  const loadBatch = useCallback(async () => {
    if (!file) return;
    if (readingRef.current) return; // prevent concurrent reads
    if (!hasMore) return;
    if (offsetRef.current >= file.size) {
      setHasMore(false);
      return;
    }

    readingRef.current = true;
    setLoading(true);
    const currentSession = sessionId;
    const decoder = new TextDecoder("utf-8");

    let localOffset = offsetRef.current;
    let localBytesRead = 0;

    try {
      const slice = file.slice(localOffset, localOffset + chunkSize);
      const buffer = await slice.arrayBuffer();
      const text = decoder.decode(buffer);
      localOffset += slice.size;
      localBytesRead += slice.size;

      const combined = remainderRef.current + text;
      const parts = combined.split(/\r?\n/);
      remainderRef.current = parts.pop() ?? "";

      const reachedEnd = localOffset >= file.size;
      if (reachedEnd && remainderRef.current && parts.length < linesPerBatch) {
        parts.push(remainderRef.current);
        remainderRef.current = "";
      }

      if (sessionId === currentSession) {
        if (parts.length) setLines((prev) => [...prev, ...parts]);
        offsetRef.current = localOffset;
        setBytesRead((prev) => prev + localBytesRead);
        const atEnd = offsetRef.current >= file.size && !remainderRef.current;
        setHasMore(!atEnd);
      }
    } catch {
      if (sessionId === currentSession) setError("Failed reading file");
    } finally {
      if (sessionId === currentSession) {
        setLoading(false);
        readingRef.current = false;
      }
    }
  }, [file, hasMore, sessionId, linesPerBatch, chunkSize]);

  // Auto-load first batch
  useEffect(() => {
    if (file && autoStart && hasMore && lines.length === 0 && !loading) {
      loadBatch();
    }
  }, [file, autoStart, hasMore, lines.length, loading, loadBatch]);

  const loadMore = useCallback(() => {
    if (!loading) loadBatch();
  }, [loading, loadBatch]);

  return {
    lines,
    loadMore,
    loading,
    error,
    hasMore,
    bytesRead,
    fileSize: file?.size ?? 0,
    reset,
    sessionId,
  };
}
