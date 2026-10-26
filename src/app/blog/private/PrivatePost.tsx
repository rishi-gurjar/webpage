'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatBlogDate } from '@/lib/dateUtils';
import { fetchPrivatePost, PrivatePostData } from '@/lib/privatePosts';
import { PrivateImg } from '../PrivateImg';
import { PageTracker } from '../PageTracker';

// Slug comes from the URL hash (/blog/private#my-post) — the site is statically
// exported so dynamic routes don't exist; the hash never reaches the server.
export function PrivatePost() {
  const router = useRouter();
  const [slug, setSlug] = useState<string | null>(null);
  const [post, setPost] = useState<PrivatePostData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const read = () => setSlug(decodeURIComponent(window.location.hash.slice(1)));
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  useEffect(() => {
    if (!slug) return;
    if (!sessionStorage.getItem('blog_private_unlocked')) {
      router.replace('/blog');
      return;
    }
    let cancelled = false;
    setPost(null);
    setFailed(false);
    fetchPrivatePost(slug)
      .then(p => { if (!cancelled) setPost(p); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [slug, router]);

  return (
    <div className="min-h-screen bg-white">
      {slug && <PageTracker path={`/blog/private/${slug}`} />}
      <main className="container flex flex-col mt-[60px] lg:mt-[calc(100vh/5.5)] lg:w-[calc(100vw/3)] md:w-[calc(100vw/3)] md:px-0">
        <Link href="/blog" className="self-start mb-4">← Back to blog</Link>
        {failed && <p>Rishi&apos;s computer is off :(</p>}
        {!post && !failed && slug && <p className="text-gray-400">Loading…</p>}
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
