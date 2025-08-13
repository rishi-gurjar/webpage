import { getPosts } from '@/lib/getPosts';
import Link from 'next/link';
import { PageTracker } from '../PageTracker';

export default async function Gallery() {
  const posts = await getPosts();
  const postsWithImages = posts.filter(post => post.headerImage);

  return (
    <div className="min-h-screen bg-white">
      <PageTracker path="/gallery" />
      
      {/* Navigation */}
      <nav className="max-w-4xl mx-auto px-6 pt-8 pb-4">
        <Link href="/blog" className="self-start mb-4">← Back to blog</Link>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pb-16">
        
        {/* Masonry Gallery Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {postsWithImages.map((post) => (
            <div key={post.slug} className="group break-inside-avoid">
              <Link href={`/blog/${post.slug}`}>
                <div className="mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={post.headerImage} 
                    alt={post.title}
                    className="w-full h-auto rounded-md object-cover hover:opacity-80 transition-opacity duration-300"
                  />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
