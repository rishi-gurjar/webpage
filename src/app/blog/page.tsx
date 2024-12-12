import { getPosts } from '@/lib/getPosts';
import { BlogSubscribe } from './BlogSubscribe';
import { PageTracker } from './PageTracker';
import Link from 'next/link';

export default async function Blog() {
  const posts = await getPosts();

  return (
    <main className="container grid flex flex-col items-center mt-[60px] lg:mt-[calc(100vh/5.5)] lg:w-[calc(100vw/3)] md:w-[calc(100vw/3)] md:px-0">
      <PageTracker path="/blog" />
      <h1 className="text-2xl text-[24px] font-['Young_Serif']">Blog</h1>
      <br />
      
      <BlogSubscribe />

      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`}>
              <h2>{post.title}</h2>
              <p>{new Date(post.date).toLocaleDateString()}</p>
              <br />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}