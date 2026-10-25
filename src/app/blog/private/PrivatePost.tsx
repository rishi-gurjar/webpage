'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_URL } from '@/lib/api';
import { formatBlogDate } from '@/lib/dateUtils';
import { PageTracker } from '../PageTracker';

interface PrivatePostData {
  slug: string;
  title: string;
  date: string;
  headerImage?: string;
  imageAuthor?: string;
  imageLink?: string;
  content: string;
}

// Local asset paths (/x.png, /blog-images/x.png) are served by the local server
function toPrivateImageUrl(src: string): string {
  return `${API_URL}/api/private-image?p=${encodeURIComponent(src.replace(/^\/+/, ''))}`;
}

// <img> can't send ngrok-skip-browser-warning, so images are fetched as blobs
// (which bypasses the interstitial) and rendered via object URLs.
function PrivateImg({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!src) return;
    if (/^https?:/i.test(src)) {
      setUrl(src);
      return;
    }
    let objUrl: string | null = null;
    let cancelled = false;
    fetch(toPrivateImageUrl(src), {
      headers: { 'ngrok-skip-browser-warning': 'true' },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blob => {
        if (cancelled) return;
        objUrl = URL.createObjectURL(blob);
        setUrl(objUrl);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [src]);

  if (failed || !url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt || ''} className={className} />;
}

// Slug comes from the URL hash (/blog/private#my-post) — the site is statically
// exported so dynamic routes don't exist; the hash never reaches the server.
export function PrivatePost() {
  const router = useRouter();
  const [slug, setSlug] = useState<string | null>(null);
  const [post, setPost] = useState<PrivatePostData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSlug(decodeURIComponent(window.location.hash.slice(1)));
  }, []);

  useEffect(() => {
    if (!slug) return;
    if (!sessionStorage.getItem('blog_private_unlocked')) {
      router.replace('/blog');
      return;
    }
    fetch(`${API_URL}/api/private-posts/${slug}`, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setPost)
      .catch(() => setFailed(true));
  }, [slug, router]);

  return (
    <div className="min-h-screen bg-white">
      {slug && <PageTracker path={`/blog/private/${slug}`} />}
      <main className="container flex flex-col mt-[60px] lg:mt-[calc(100vh/5.5)] lg:w-[calc(100vw/3)] md:w-[calc(100vw/3)] md:px-0">
        <Link href="/blog" className="self-start mb-4">← Back to blog</Link>
        {failed && <p>Rishi&apos;s computer is off :(</p>}
        {post && (
          <>
            {post.headerImage && (
              <div className="w-full mb-8 relative aspect-[16/9]">
                <PrivateImg
                  src={post.headerImage}
                  alt={post.imageAuthor || `Header image for ${post.title}`}
                  className="rounded-lg object-cover w-full h-full"
                />
              </div>
            )}
            <h1 className="text-2xl text-[24px] font-['Young_Serif']">{post.title}</h1>
            <p>{formatBlogDate(post.date)}</p>
            <br />
            <div className="blog-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ src, alt }) => (
                    <PrivateImg src={typeof src === 'string' ? src : undefined} alt={alt} />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
