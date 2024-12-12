import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { notFound } from 'next/navigation';
import './blogPost.css';
import Link from 'next/link';
import { generateSlug } from '@/lib/blog';
import { PageTracker } from '../PageTracker';


export async function generateStaticParams() {
  const blogDir = path.join(process.cwd(), 'src/blog-content');
  const files = fs.readdirSync(blogDir);

  return files.map((filename) => {
    const filePath = path.join(blogDir, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);
    return {
      slug: generateSlug(data.title),
    };
  });
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const blogDir = path.join(process.cwd(), 'src/blog-content');
  const files = fs.readdirSync(blogDir);
  const post = files
    .map((filename) => {
      const filePath = path.join(blogDir, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      const clean_content = content
      .replace(/\\\n/g, '\n\n')  // Replace backslash-newlines with double newlines
      .replace(/\\$/gm, '')      // Remove trailing backslashes
      .replace(/(\d+)\.\s*/g, '$1. ')  // Ensure proper spacing for list items
      .replace(/\n\n\n+/g, '\n\n');    // Normalize multiple newlines to double newlines

      return {
        slug: generateSlug(data.title),
        title: data.title,
        date: data.date,
        content: clean_content,
      };
    })
    .find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  // Process the Markdown content
  const processedContent = await remark()
    .use(html)
    .process(post.content);
  const contentHtml = processedContent.toString();

  return (
    <main className="container grid flex flex-col items-center mt-[60px] lg:mt-[calc(100vh/5.5)] lg:w-[calc(100vw/3)] md:w-[calc(100vw/3)] md:px-0">
      <PageTracker path={`/blog/${params.slug}`} />
      <Link href="/blog" className="self-start mb-4">← Back to blog</Link>
      <h1 className="text-2xl text-[24px] font-['Young_Serif']">{post.title}</h1>
      <p>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      <br />
      <div className="blog-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      <br />
    </main>
  );
}