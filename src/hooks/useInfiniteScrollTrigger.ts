import { useEffect, useLayoutEffect, useRef } from "react";

interface UseInfiniteScrollTriggerOptions {
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  itemsLength: number;
  rootMargin?: string; // allow override if needed
  interactionKeys?: string[];
}

interface UseInfiniteScrollTriggerResult {
  sentinelRef: React.RefObject<HTMLDivElement>;
  canLoadMore: boolean;
}

/**
 * Provides an intersection-based infinite scroll trigger with user-intent gating.
 * Prevents automatic page increments when initial content does not overflow the viewport
 * until the user performs an interaction (scroll/wheel/touch/key) OR content was already scrollable.
 */
export function useInfiniteScrollTrigger({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  itemsLength,
  rootMargin = "0px",
  interactionKeys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "End"],
}: UseInfiniteScrollTriggerOptions): UseInfiniteScrollTriggerResult {
  // Use non-nullable ref type for consumer elements; initialize later via assignment
  const sentinelRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
  const hasUserIntentRef = useRef(false); // becomes true after user interaction
  const initialScrollableRef = useRef(false); // whether content exceeds viewport height after first render

  // Recompute scrollability when items length changes (new page appended)
  useLayoutEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    initialScrollableRef.current = document.documentElement.scrollHeight > window.innerHeight;
  }, [itemsLength]);

  // Keep a record of last items length to detect real growth
  const lastItemsLengthRef = useRef(itemsLength);
  const autoFillAttemptsRef = useRef(0);

  // Auto-fill viewport on large screens: while content not scrollable, keep requesting next pages
  useEffect(() => {
    const grew = itemsLength > lastItemsLengthRef.current;
    if (grew) {
      lastItemsLengthRef.current = itemsLength;
      autoFillAttemptsRef.current = 0; // reset attempts after successful growth
    }

    const notScrollable = !initialScrollableRef.current;
    const canTryMore = autoFillAttemptsRef.current < 5; // hard safety cap

    if (notScrollable && canTryMore && hasNextPage && !isFetchingNextPage) {
      autoFillAttemptsRef.current += 1;
      fetchNextPage();
    }
  }, [itemsLength, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Detect user interaction
  useEffect(() => {
    const activate = () => {
      if (!hasUserIntentRef.current) hasUserIntentRef.current = true;
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (interactionKeys.includes(e.key)) activate();
    };
    window.addEventListener("scroll", activate, { passive: true });
    window.addEventListener("wheel", activate, { passive: true });
    window.addEventListener("touchmove", activate, { passive: true });
    window.addEventListener("keydown", keyHandler);
    return () => {
      window.removeEventListener("scroll", activate);
      window.removeEventListener("wheel", activate);
      window.removeEventListener("touchmove", activate);
      window.removeEventListener("keydown", keyHandler);
    };
  }, [interactionKeys]);

  // Intersection observer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          // Allow loads only if content is scrollable OR user showed intent to scroll
          (initialScrollableRef.current || hasUserIntentRef.current)
        ) {
          fetchNextPage();
        }
      },
      { rootMargin, threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, rootMargin]);

  return { sentinelRef, canLoadMore: Boolean(hasNextPage) };
}
