import { getPosts } from '@/lib/getPosts';
import { BlogSubscribe } from './BlogSubscribe';
import { BeliefsList } from './BeliefsList';
import { PageTracker } from './PageTracker';
import { BlogList } from './BlogList';
import Link from 'next/link';

export default async function Blog() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-white">
      <PageTracker path="/blog" />
      
      {/* Navigation */}
      <nav className="max-w-4xl mx-auto px-6 pt-8 pb-4">
      <Link href="/blog" className="self-start mb-4">← Back to blog</Link>

      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pb-16">
        
        {/* Header Section */}
        <header className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-['Young_Serif'] mt-2 text-blue-300 hover:text-red-600 transition-colors duration-300 mb-6">
            Blog
          </h1>
        </header>

        {/* Two Column Layout for Large Screens */}
        <div className="grid lg:grid-cols-[1fr,320px] gap-8 lg:gap-12">
          
          {/* Blog List - Main Column */}
          <div className="order-2 lg:order-1">
            <BlogList posts={posts} />
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