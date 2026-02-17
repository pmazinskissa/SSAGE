import { compile } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import { getFromCache, setInCache } from './content-cache.js';

export async function compileMdx(source: string, filePath: string): Promise<string> {
  const cacheKey = `mdx:${filePath}`;
  const cached = getFromCache<string>(cacheKey);
  if (cached) return cached;

  const compiled = await compile(source, {
    outputFormat: 'function-body',
    development: false,
    remarkPlugins: [remarkGfm],
  });

  const result = String(compiled);
  setInCache(cacheKey, result);
  return result;
}
