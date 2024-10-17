import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { notFound } from 'next/navigation';
import './blogPost.css';

export async function generateStaticParams() {
  const blogDir = path.join(process.cwd(), 'src/blog-content');
  const files = fs.readdirSync(blogDir);

  return files.map((filename) => {
    const filePath = path.join(blogDir, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);
    return {
      slug: data.title.toLowerCase().replace(/\s+/g, '-'),
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
      return {
        slug: data.title.toLowerCase().replace(/\s+/g, '-'),
        title: data.title,
        date: data.date,
        content,
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
      <h1>{post.title}</h1>
      <p>{new Date(post.date).toLocaleDateString()}</p>
      <br />
      <div className="blog-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      <br />
    </main>
  );
}