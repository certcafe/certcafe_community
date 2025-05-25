// src/lib/cache.ts (새 파일)
const cache = new Map();

export async function getCached(key: string) {
  const item = cache.get(key);
  if (item && item.expires > Date.now()) {
    console.log(`🎯 Cache HIT: ${key}`);
    return item.data;
  }
  console.log(`❌ Cache MISS: ${key}`);
  return null;
}

export function setCached(key: string, data: any, ttlSeconds = 3600) {
  cache.set(key, {
    data,
    expires: Date.now() + (ttlSeconds * 1000)
  });
  console.log(`💾 Cached: ${key}`);
}