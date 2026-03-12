import { useEffect, useMemo, useState } from 'react';

import { extractApiErrorMessage } from '../api/client';
import { mapBackendProductDetailToUiProduct } from '../api/adapters';
import { getBackendProductDetailCached } from '../api/productDetailsCache';
import { Product } from '../types/models';

const uiCache = new Map<string, Product>();

function normalizeSlugs(slugs: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of slugs) {
    const slug = (raw ?? '').trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}

export function useUiProductsBySlugs(slugs: string[], params?: { lang?: string }) {
  const lang = params?.lang ?? 'ru';
  const normalized = useMemo(() => normalizeSlugs(slugs), [slugs.join('|')]);

  const [productsById, setProductsById] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (normalized.length === 0) {
        setProductsById({});
        setLoading(false);
        setErrorMessage(null);
        return;
      }

      setLoading(true);
      setErrorMessage(null);

      try {
        const results = await Promise.all(
          normalized.map(async (slug) => {
            const cached = uiCache.get(slug);
            if (cached) return cached;
            const backend = await getBackendProductDetailCached(slug, { lang });
            const ui = mapBackendProductDetailToUiProduct({ item: backend });
            uiCache.set(slug, ui);
            return ui;
          }),
        );

        if (cancelled) return;
        const next: Record<string, Product> = {};
        for (const p of results) next[p.id] = p;
        setProductsById(next);
      } catch (e) {
        if (cancelled) return;
        setErrorMessage(extractApiErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lang, normalized]);

  const products = useMemo(() => Object.values(productsById), [productsById]);

  return {
    productsById,
    products,
    loading,
    errorMessage,
  };
}
