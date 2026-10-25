import { getPosts } from '@/lib/getPosts';
import { BlogLanding } from './BlogLanding';

export default async function Blog() {
  const posts = await getPosts();

  return <BlogLanding posts={posts} />;
}
