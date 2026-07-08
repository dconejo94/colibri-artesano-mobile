import { useState, useEffect, useCallback } from 'react';
import { autocomplete, search, SearchScope, AutocompleteResponse, SearchResponse } from '@/api/search';
import { normalizeError, type ApiError } from '@/src/api/errors';
import type { PaginatedResponse } from '@/types/store';

export function useSearch(initialScope: SearchScope = 'all') {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>(initialScope);
  const [suggestions, setSuggestions] = useState<AutocompleteResponse | any[] | null>(null);
  
  // For full search results
  const [results, setResults] = useState<SearchResponse | PaginatedResponse<any> | null>(null);
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
      if (page === 1) {
        setResults(res);
      } else {
        if (activeScope === 'all') {
            // scope='all' doesn't paginate deeply
            setResults(res);
        } else {
            setResults((prev: any) => ({
                ...prev,
                items: [...(prev?.items || []), ...(res as PaginatedResponse<any>).items],
                page: (res as PaginatedResponse<any>).page,
                total: (res as PaginatedResponse<any>).total,
            }));
        }
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
