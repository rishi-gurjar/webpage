'use client';

import { useEffect, useState } from 'react';
import { prefetchImage } from '@/lib/privatePosts';

// <img> can't send ngrok-skip-browser-warning, so images are fetched as blobs
// (cached in prefetchImage — usually already warm after unlock).
export function PrivateImg({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    prefetchImage(src)
      .then(u => { if (!cancelled) setUrl(u); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [src]);

  if (failed || !url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt || ''} className={className} />;
}
