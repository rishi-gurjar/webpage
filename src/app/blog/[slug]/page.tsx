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
import privacyImg from '/public/privacy_img.png';
import snowImg from '/public/snow.png';
import tasteImg from '/public/taste.png';
import contractImg from '/public/contract.png';
import dictatorImg from '/public/dictator.png';
import sabotageImg from '/public/sabotage.jpg';
import { Metadata } from 'next';
import ernstImg from '/public/ernst.png';
import napoleonImg from '/public/napoleon.png';
import airImg from '/public/air.jpg';
import mosesImg from '/public/moses.png';
import skiImg from '/public/ski.png';
import mimesisImg from '/public/mimesis.png';
import nudgeImg from '/public/nudge.png';
import machinaImg from '/public/machina.jpg';
import appmassImg from '/public/appmass.png';
import buzzImg from '/public/buzz.png';
import theworldImg from '/public/theworld.png';
import orgImg from '/public/org.png';
import thinkersImg from '/public/thinkers.png';
import blindImg from '/public/blind.png';
import sageImg from '/public/sage.png';
import durerImg from '/public/durer.png';
import batImg from '/public/bat.png';
import cliffsImg from '/public/cliffs.png';
import preconciousImg from '/public/preconcious.png';
import stpeterImg from '/public/stpeter.png';
import natImg from '/public/nat.png';
import altImg from '/public/alt.png';
import coroImg from '/public/coro.png';
import hansImg from '/public/hans.png';
import dockImg from '/public/dock.png';
import krelImg from '/public/krel.png';

// Create a mapping for your blog images
const headerImages: { [key: string]: any } = {
  '/privacy_img.png': privacyImg,
  '/snow.png': snowImg,
  '/taste.png': tasteImg,
  '/contract.png': contractImg,
  '/dictator.png': dictatorImg,
  '/sabotage.jpg': sabotageImg,
  '/ernst.png': ernstImg,
  '/napoleon.png': napoleonImg,
  '/air.jpg': airImg,
  '/moses.png': mosesImg,
  '/ski.png': skiImg,
  '/mimesis.png': mimesisImg,
  '/nudge.png': nudgeImg,
  '/machina.jpg': machinaImg,
  '/appmass.png': appmassImg,
  '/buzz.png': buzzImg,
  '/theworld.png': theworldImg,
  '/org.png': orgImg,
  '/thinkers.png': thinkersImg,
  '/blind.png': blindImg,
  '/sage.png': sageImg,
  '/durer.png': durerImg,
  '/bat.png': batImg,
  '/cliffs.png': cliffsImg,
  '/preconcious.png': preconciousImg,
  '/stpeter.png': stpeterImg,
  '/nat.png': natImg,
  '/alt.png': altImg,
  '/coro.png': coroImg,
  '/hans.png': hansImg,
  '/dock.png': dockImg,
  '/krel.png': krelImg,
};

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

// Add metadata types
type Props = {
  params: Promise<{ slug: string }>
}

// Add generateMetadata function
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const publishedTime = new Date(post.date).toISOString();
  
  // Construct the image URL for Open Graph
  const imageUrl = post.headerImage ? `https://rishigurjar.com${post.headerImage}` : undefined;

  return {
    title: post.title,
    description: post.content.substring(0, 160),
    authors: [{
      name: 'Rishi Gurjar',
      url: 'https://rishigurjar.com',
    }],
    openGraph: {
      title: post.title,
      description: post.content.substring(0, 160),
      type: 'article',
      publishedTime,
      authors: ['Rishi Gurjar'],
      siteName: "Rishi Gurjar's Blog",
      images: imageUrl ? [{
        url: imageUrl,
        width: 1200,
        height: 675,
        alt: post.title,
      }] : undefined,
    }
  };
}

// Add helper function to get post data
async function getPost(slug: string): Promise<BlogPost | null> {
  const blogDir = path.join(process.cwd(), 'src/blog-content');
  const allFiles = fs.readdirSync(blogDir);
  
  // Filter to only include files, not directories
  const files = allFiles.filter(filename => {
    const filePath = path.join(blogDir, filename);
    return fs.statSync(filePath).isFile();
  });

  for (const filename of files) {
    const filePath = path.join(blogDir, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    if (generateSlug(data.title) === slug) {
      return {
        slug,
        title: data.title,
        date: data.date,
        content,
        headerImage: data.headerImage,
        imageAuthor: data.imageAuthor,
        imageLink: data.imageLink,
      };
    }
  }
  return null;
}

export async function generateStaticParams() {
  const blogDir = path.join(process.cwd(), 'src/blog-content');
  const files = fs.readdirSync(blogDir);
  
  return files
    .filter(filename => {
      const filePath = path.join(blogDir, filename);
      // Skip directories
      return fs.statSync(filePath).isFile();
    })
    .map((filename) => {
      const filePath = path.join(blogDir, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      return {
        slug: generateSlug(data.title),
      };
    });
}

// Add this function to process image paths before markdown processing
function processImagePaths(content: string): string {
  // Replace markdown image syntax that starts with /
  // This will convert ![alt](/image.png) to ![alt](/blog-images/image.png)
  return content.replace(/!\[(.*?)\]\(\/([^)]+)\)/g, '![$1](/blog-images/$2)');
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const blogDir = path.join(process.cwd(), 'src/blog-content');
  const allFiles = fs.readdirSync(blogDir);
  
  // Filter to get only files, not directories
  const files = allFiles.filter(filename => {
    const filePath = path.join(blogDir, filename);
    return fs.statSync(filePath).isFile();
  });

  // Get all posts and sort them by date
  const posts: BlogPost[] = files
    .map((filename) => {
      const filePath = path.join(blogDir, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      // Updated content cleaning to better handle markdown links
      const clean_content = content
        .replace(/\\\n/g, '\n\n')
        .replace(/\\$/gm, '')
        .replace(/^(\d+)\.\s*/gm, '$1. ')
        .replace(/\n\n\n+/g, '\n\n')
        // Fix markdown links that got broken by line breaks
        .replace(/\[([^\]]+)\]\(([^)]+?)\s+/g, '[$1]($2')
        .replace(/\s+\)/g, ')');

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
  const currentIndex = posts.findIndex((post) => post.slug === slug);
  if (currentIndex === -1) {
    notFound();
  }

  const post = posts[currentIndex];
  const previousPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : null;

  // Process image paths first, then process markdown
  const contentWithFixedPaths = processImagePaths(post.content);
  
  // Process the Markdown content
  const processedContent = await remark()
    .use(html)
    .process(contentWithFixedPaths);
  const contentHtml = processedContent.toString();

  // Add JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(),
    author: {
      '@type': 'Person',
      name: 'Rishi Gurjar',
      url: 'https://rishigurjar.com',
      jobTitle: 'Student',
      sameAs: [
        'https://github.com/rishi-gurjar',
        'https://www.linkedin.com/in/rishigurjar/',
        'https://x.com/rishi__gurjar',
      ]
    },
    image: post.headerImage ? `https://rishigurjar.com${post.headerImage}` : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://rishigurjar.com/blog/${slug}`
    },
    publisher: {
      '@type': 'Person',
      name: 'Rishi Gurjar'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container grid flex flex-col items-center mt-[60px] lg:mt-[calc(100vh/5.5)] lg:w-[calc(100vw/3)] md:w-[calc(100vw/3)] md:px-0">
        <PageTracker path={`/blog/${slug}`} />
        <Link href="/blog" className="self-start mb-4">← Back to blog</Link>
        {post.headerImage && (
          <>
            <div className="w-full mb-2 relative aspect-[16/9]">
              <Image
                src={headerImages[post.headerImage]}
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
    </>
  );
}