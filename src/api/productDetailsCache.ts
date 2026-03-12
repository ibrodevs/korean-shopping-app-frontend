import { BackendProductDetail, getProductDetail } from './catalog';

const cache = new Map<string, BackendProductDetail>();
const inflight = new Map<string, Promise<BackendProductDetail>>();

function makeKey(slug: string, lang: string): string {
  return `${lang}::${slug}`;
}

export async function getBackendProductDetailCached(slug: string, params?: { lang?: string }): Promise<BackendProductDetail> {
  const lang = params?.lang ?? 'ru';
  const key = makeKey(slug, lang);

  const cached = cache.get(key);
  if (cached) return cached;

  const running = inflight.get(key);
  if (running) return running;

  const promise = (async () => {
    try {
      const detail = await getProductDetail(slug, { lang });
      cache.set(key, detail);
      return detail;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}

export function primeBackendProductDetailCache(slug: string, detail: BackendProductDetail, params?: { lang?: string }) {
  const lang = params?.lang ?? 'ru';
  cache.set(makeKey(slug, lang), detail);
}
