'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

export type PageContent = Record<string, { es: string; en: string }>;

const cache: Record<string, PageContent> = {};

function readLocalStorage(page: string): PageContent | null {
  try {
    const stored = localStorage.getItem(`mvc_content_${page}`);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

function writeLocalStorage(page: string, data: PageContent) {
  try { localStorage.setItem(`mvc_content_${page}`, JSON.stringify(data)); } catch { /* ignore */ }
}

export function usePageContent(page: string, initialData?: PageContent) {
  // Always update in-memory cache from server-provided initial data (fresh on every SSR render)
  if (initialData && Object.keys(initialData).length > 0) {
    cache[page] = initialData;
  }

  const [content, setContent] = useState<PageContent>(cache[page] || {});

  useEffect(() => {
    // In-memory cache is warm (within session) — use it and skip fetch
    if (cache[page] && Object.keys(cache[page]).length > 0) {
      setContent(cache[page]);
      return;
    }

    // Restore from localStorage immediately to eliminate flash on reload
    const stored = readLocalStorage(page);
    if (stored && Object.keys(stored).length > 0) {
      setContent(stored);
      // Don't return — still fetch fresh data below
    }

    fetch(`/api/content?page=${page}`)
      .then(r => r.ok ? r.json() : {})
      .then((data: PageContent) => {
        cache[page] = data;
        writeLocalStorage(page, data);
        setContent(data);
      })
      .catch(() => {});
  }, [page]);

  function get(key: string, lang: 'es' | 'en', fallback = ''): string {
    return content[key]?.[lang] || fallback;
  }

  function getSize(key: string): CSSProperties {
    const size = content[`${key}_size`]?.es;
    return size ? { fontSize: size } : {};
  }

  return { content, get, getSize };
}
