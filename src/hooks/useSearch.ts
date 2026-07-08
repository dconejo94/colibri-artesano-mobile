import { useState, useEffect, useCallback } from 'react';
import { autocomplete, search } from '@/api/search';
import { normalizeError, type ApiError } from '@/src/api/errors';
import type { SearchScope, AutocompleteResult, SearchResult } from '@/types/search';

export function useSearch(initialScope: SearchScope = 'all') {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>(initialScope);
  const [suggestions, setSuggestions] = useState<AutocompleteResult | null>(null);

  // Keep the scope in sync when the caller-provided scope changes (e.g. a
  // parent screen switches scope). Without this, `initialScope` is only ever
  // the first render's value and later changes never reach this instance.
  useEffect(() => {
    setScope(initialScope);
  }, [initialScope]);

  // For full search results
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Debounced Autocomplete
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions(null);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const res = await autocomplete(query, scope);
        setSuggestions(res);
      } catch (err) {
        // Silently suppress autocomplete errors as requested
        console.warn('Autocomplete error:', err);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query, scope]);

  const performSearch = useCallback(async (q: string, activeScope: SearchScope, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await search(q, activeScope, page, 20);
      if (page === 1 || res.scope === 'all') {
        // scope='all' doesn't paginate deeply — always a fresh replace.
        setResults(res);
      } else if (res.scope === 'products') {
        // scope='products' | 'stores' | 'categories': append this page's
        // items onto whatever we already had for the same scope. Branching
        // explicitly on res.scope (rather than a generic prev.items merge)
        // keeps each branch's item type tied to a single member of the
        // SearchResult union instead of the union of all three. Dedup by id so
        // a page fetched twice (e.g. rapid onEndReached) can't duplicate rows.
        setResults((prev) => {
          const prevItems = prev?.scope === 'products' ? prev.items : [];
          const seen = new Set(prevItems.map((i) => i.id));
          return { ...res, items: [...prevItems, ...res.items.filter((i) => !seen.has(i.id))] };
        });
      } else if (res.scope === 'stores') {
        setResults((prev) => {
          const prevItems = prev?.scope === 'stores' ? prev.items : [];
          const seen = new Set(prevItems.map((i) => i.id));
          return { ...res, items: [...prevItems, ...res.items.filter((i) => !seen.has(i.id))] };
        });
      } else {
        setResults((prev) => {
          const prevItems = prev?.scope === 'categories' ? prev.items : [];
          const seen = new Set(prevItems.map((i) => i.id));
          return { ...res, items: [...prevItems, ...res.items.filter((i) => !seen.has(i.id))] };
        });
      }
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    query,
    setQuery,
    scope,
    setScope,
    suggestions,
    results,
    isLoading,
    error,
    performSearch,
  };
}
