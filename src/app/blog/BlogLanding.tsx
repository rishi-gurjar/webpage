'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BlogSubscribe } from './BlogSubscribe';
import { BeliefsList } from './BeliefsList';
import { PageTracker } from './PageTracker';
import { BlogList } from './BlogList';
import { API_URL } from '@/lib/api';
import { formatBlogDate } from '@/lib/dateUtils';

interface Post {
  slug: string;
  title: string;
  date: string;
  formattedDate: string;
  headerImage?: string;
  isPrivate?: boolean;
}

const UNLOCK_KEY = 'blog_private_unlocked';

export function BlogLanding({ posts }: { posts: Post[] }) {
  const [unlocked, setUnlocked] = useState(false);
  const [privatePosts, setPrivatePosts] = useState<Post[]>([]);
  const [offline, setOffline] = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(UNLOCK_KEY)) {
      setUnlocked(true);
      fetchPrivatePosts();
    }
  }, []);

  async function fetchPrivatePosts() {
    try {
      const res = await fetch(`${API_URL}/api/private-posts`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Post[] = await res.json();
      setPrivatePosts(data.map(p => ({
        ...p,
        isPrivate: true,
        formattedDate: formatBlogDate(p.date),
      })));
    } catch {
      setOffline(true);
    }
  }

  function handleTitleClick() {
    if (unlocked) return;
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);

    if (clickCount.current >= 3) {
      clickCount.current = 0;
      sessionStorage.setItem(UNLOCK_KEY, '1');
      setUnlocked(true);
      fetchPrivatePosts();
    } else {
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, 1500);
    }
  }

  const allPosts = [...posts, ...privatePosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 ${unlocked ? 'bg-red-600 blog-unlocked' : 'bg-white'}`}>
      <PageTracker path="/blog" />

      {/* Navigation */}
      <nav className="max-w-4xl mx-auto px-6 pt-8 pb-4">
        <Link href="/" className="self-start mb-4">← Back to home</Link>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pb-16">

        {/* Header Section */}
        <header className="mb-12">
          <h1
            onClick={handleTitleClick}
            className={`text-4xl lg:text-5xl font-['Young_Serif'] mt-2 mb-6 select-none cursor-pointer transition-colors duration-300 ${
              unlocked ? 'text-white' : 'text-blue-300 hover:text-red-600'
            }`}
          >
            Blog
          </h1>
          {offline && (
            <p className="text-sm text-white/80">Rishi&apos;s computer is off :(</p>
          )}
        </header>

        {/* Two Column Layout for Large Screens */}
        <div className="grid lg:grid-cols-[1fr,320px] gap-8 lg:gap-12">

          {/* Blog List - Main Column */}
          <div className="order-2 lg:order-1">
            <BlogList posts={allPosts} unlocked={unlocked} />
          </div>

          {/* Sidebar - Secondary Column */}
          <div className="order-1 lg:order-2 space-y-4">
            <BlogSubscribe />
            <BeliefsList />
          </div>

        </div>
      </main>
    </div>
  );
}
