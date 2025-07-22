'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Post {
  slug: string;
  title: string;
  date: string;
  headerImage?: string;
}

interface BlogListProps {
  posts: Post[];
}

export function BlogList({ posts }: BlogListProps) {
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 640); // sm breakpoint is 640px
    };

    // Initial check
    handleResize();

    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMouseEnter = (slug: string) => {
    if (isLargeScreen) {
      setHoveredPost(slug);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPost(null);
  };

  const hoveredPostData = posts.find(post => post.slug === hoveredPost);

  return (
    <>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link 
              href={`/blog/${post.slug}`}
              onMouseEnter={() => handleMouseEnter(post.slug)}
              onMouseLeave={handleMouseLeave}
              className="block hover:opacity-80 transition-opacity"
            >
              <h2 className="font-['Young_Serif'] font-light">{post.title}</h2>
              <p className="">{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <br />
            </Link>
          </li>
        ))}
      </ul>

      {/* Floating preview image */}
      {isLargeScreen && hoveredPost && hoveredPostData?.headerImage && (
        <div
          className="fixed pointer-events-none z-50 transition-opacity duration-200"
          style={{
            left: mousePosition.x + 20,
            top: mousePosition.y - 100,
          }}
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <Image
              src={hoveredPostData.headerImage}
              width={400}
              height={300}
              alt={hoveredPostData.title}
              className="object-cover"
            />
          </div>
        </div>
      )}
    </>
  );
} 