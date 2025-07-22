import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { generateSlug } from './blog';

export async function getPosts() {
  const blogDir = path.join(process.cwd(), 'src/blog-content');
  const allFiles = await fs.readdir(blogDir);
  
  const posts = [];
  
  for (const filename of allFiles) {
    const filePath = path.join(blogDir, filename);
    
    // Skip directories
    try {
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) continue;
      
      const fileContents = await fs.readFile(filePath, 'utf8');
      const { data } = matter(fileContents);
      posts.push({
        slug: generateSlug(data.title),
        title: data.title,
        date: data.date,
        headerImage: data.headerImage,
      });
    } catch (error) {
      console.error(`Error processing ${filename}:`, error);
    }
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
} 