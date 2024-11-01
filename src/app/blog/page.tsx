import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { generateSlug } from '@/lib/blog';

export default function Blog() {
  const blogDir = path.join(process.cwd(), 'src/blog-content');
  const files = fs.readdirSync(blogDir);

  const posts = files.map((filename) => {
    const filePath = path.join(blogDir, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);
    return {
      slug: generateSlug(data.title),
      title: data.title,
      date: data.date,
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main className="container grid flex flex-col items-center mt-[60px] lg:mt-[calc(100vh/5.5)] lg:w-[calc(100vw/3)] md:w-[calc(100vw/3)] md:px-0">
      <h1><b>Blog</b></h1>
      <br />
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