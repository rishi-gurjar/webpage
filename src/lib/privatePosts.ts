import { API_URL } from './api';

const NGROK_HEADERS = { 'ngrok-skip-browser-warning': 'true' };

export interface PrivatePostData {
  slug: string;
  title: string;
  date: string;
  headerImage?: string;
  imageAuthor?: string;
  imageLink?: string;
  content: string;
}

const postCache = new Map<string, Promise<PrivatePostData>>();
const imageCache = new Map<string, Promise<string>>();

export function privateImageApiUrl(src: string): string {
  return `${API_URL}/api/private-image?p=${encodeURIComponent(src.replace(/^\/+/, ''))}`;
}

export function fetchPrivatePost(slug: string): Promise<PrivatePostData> {
  let p = postCache.get(slug);
  if (!p) {
    p = fetch(`${API_URL}/api/private-posts/${slug}`, { headers: NGROK_HEADERS })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .catch(err => {
        postCache.delete(slug);
        throw err;
      });
    postCache.set(slug, p);
  }
  return p;
}

// Images can't be <img>-loaded (ngrok interstitial) — fetched as blobs and
// cached as object URLs so repeat renders are instant.
export function prefetchImage(src: string): Promise<string> {
  if (/^https?:/i.test(src)) return Promise.resolve(src);
  const key = privateImageApiUrl(src);
  let p = imageCache.get(key);
  if (!p) {
    p = fetch(key, { headers: NGROK_HEADERS })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blob => URL.createObjectURL(blob))
      .catch(err => {
        imageCache.delete(key);
        throw err;
      });
    imageCache.set(key, p);
  }
  return p;
}

// After unlock: pull every private post + all its images in the background so
// opening a post renders immediately.
export function warmPrivatePosts(metas: { slug: string }[]) {
  for (const m of metas) {
    fetchPrivatePost(m.slug)
      .then(post => {
        if (post.headerImage) prefetchImage(post.headerImage);
        const imgRe = /!\[[^\]]*\]\((\/[^)\s]+)\)/g;
        let match: RegExpExecArray | null;
        while ((match = imgRe.exec(post.content)) !== null) {
          prefetchImage(match[1]);
        }
      })
      .catch(() => {});
  }
}
