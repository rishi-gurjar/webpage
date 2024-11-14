import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { generateSlug } from './blog';

export async function getPosts() {
  const blogDir = path.join(process.cwd(), 'src/blog-content');
  const files = await fs.readdir(blogDir);

  const posts = await Promise.all(files.map(async (filename) => {
    const filePath = path.join(blogDir, filename);
    const fileContents = await fs.readFile(filePath, 'utf8');
    const { data } = matter(fileContents);
    return {
      slug: generateSlug(data.title),
      title: data.title,
      date: data.date,
    };
  }));

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
} 