"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UsePaginatedListOptions<T> {
  baseUrl: string;
  filtersKey: string;
  getItems: (data: Record<string, unknown>) => T[];
  getHasMore: (data: Record<string, unknown>) => boolean;
}

export function usePaginatedList<T>({
  baseUrl,
  filtersKey,
  getItems,
  getHasMore,
}: UsePaginatedListOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const [debouncedKey, setDebouncedKey] = useState(filtersKey);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKey(filtersKey), 200);
    return () => clearTimeout(t);
  }, [filtersKey]);

  const fetchPage = useCallback(
    async (pageNum: number, append: boolean) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (append) setLoadingMore(true);
      else setLoading(true);

      const sep = baseUrl.includes("?") ? "&" : "?";
      const url = `${baseUrl}${sep}page=${pageNum}${debouncedKey ? `&${debouncedKey}` : ""}`;

      try {
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        if (controller.signal.aborted) return;

        const newItems = getItems(data);
        setItems((prev) => (append ? [...prev, ...newItems] : newItems));
        setMeta(data);
        setHasMore(getHasMore(data));
        setPage(pageNum);
      } catch (e) {
        if ((e as Error).name !== "AbortError") console.error(e);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [baseUrl, debouncedKey, getItems, getHasMore]
  );

  useEffect(() => {
    fetchPage(1, false);
    return () => abortRef.current?.abort();
  }, [fetchPage]);

  function loadMore() {
    if (!loadingMore && hasMore) fetchPage(page + 1, true);
  }

  function refresh() {
    fetchPage(1, false);
  }

  return { items, meta, loading, loadingMore, hasMore, loadMore, refresh };
}
