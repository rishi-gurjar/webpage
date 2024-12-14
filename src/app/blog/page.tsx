import { getPosts } from '@/lib/getPosts';
import { BlogSubscribe } from './BlogSubscribe';
import { PageTracker } from './PageTracker';
import Link from 'next/link';

export default async function Blog() {
  const posts = await getPosts();

  return (
    <main className="container grid flex flex-col items-center mt-[60px] lg:mt-[calc(100vh/5.5)] lg:w-[calc(150vw/3)] md:w-[calc(100vw/3)] md:px-0">
      <PageTracker path="/blog" />
      <Link href="/" className="self-start mb-4">← Back to home</Link>
      <h1 className="text-2xl text-[24px] font-['Young_Serif']">Blog</h1>
      <br />
      
      <BlogSubscribe />

      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`}>
              <h2 className="font-['Young_Serif'] font-light">{post.title}</h2>
              <p className=''>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <br />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}