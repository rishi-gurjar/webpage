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
import Image from 'next/image';

// Add this interface for better type safety
interface BlogPost {
  slug: string;
  title: string;
  date: string;
  content: string;
  headerImage?: string;
  imageAuthor?: string;
  imageLink?: string;
}

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

  // Get all posts and sort them by date
  const posts: BlogPost[] = files
    .map((filename) => {
      const filePath = path.join(blogDir, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      const clean_content = content
        .replace(/\\\n/g, '\n\n')
        .replace(/\\$/gm, '')
        .replace(/(\d+)\.\s*/g, '$1. ')
        .replace(/\n\n\n+/g, '\n\n');

      return {
        slug: generateSlug(data.title),
        title: data.title,
        date: data.date,
        content: clean_content,
        headerImage: data.headerImage,
        imageAuthor: data.imageAuthor,
        imageLink: data.imageLink,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Find the current post index
  const currentIndex = posts.findIndex((post) => post.slug === params.slug);
  if (currentIndex === -1) {
    notFound();
  }

  const post = posts[currentIndex];
  const previousPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : null;

  // Process the Markdown content
  const processedContent = await remark()
    .use(html)
    .process(post.content);
  const contentHtml = processedContent.toString();

  return (
    <main className="container grid flex flex-col items-center mt-[60px] lg:mt-[calc(100vh/5.5)] lg:w-[calc(100vw/3)] md:w-[calc(100vw/3)] md:px-0">
      <PageTracker path={`/blog/${params.slug}`} />
      <Link href="/blog" className="self-start mb-4">← Back to blog</Link>
      {post.headerImage && (
        <>
          <div className="w-full mb-2 relative aspect-[16/9]">
            <Image 
              src={post.headerImage} 
              alt={post.imageAuthor || `Header image for ${post.title}`}
              fill
              className="rounded-lg object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>
          <div className="w-full mb-8 text-sm text-gray-600 italic">
            {post.imageLink && (
              <p className="text-right">
                {post.imageLink ? (
                  <a 
                    href={post.imageLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    {post.imageAuthor}
                  </a>
                ) : (
                  post.imageAuthor
                )}
              </p>
            )}
          </div>
        </>
      )}
      <h1 className="text-2xl text-[24px] font-['Young_Serif']">{post.title}</h1>
      <p>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      <br />
      <div className="blog-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      <br />

      {/* Add navigation links */}
      <div className="w-full flex flex-col gap-4 mt-8 border-t pt-4">
        <h1 className="">Nearby</h1>

        <div className="flex justify-between w-full">
          {previousPost ? (
            <Link href={`/blog/${previousPost.slug}`} className="text-green-600 hover:underline font-['Young_Serif']">
              ← {previousPost.title}
            </Link>
          ) : (
            <div></div>
          )}
          {nextPost ? (
            <Link href={`/blog/${nextPost.slug}`} className="text-green-600 hover:underline ml-auto font-['Young_Serif']">
              {nextPost.title} →
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
      <br />
    </main>
  );
}