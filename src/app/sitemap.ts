import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { generateSlug } from '@/lib/blog'

export default function sitemap(): MetadataRoute.Sitemap {
    // Get all blog posts
    const blogDir = path.join(process.cwd(), 'src/blog-content')
    const files = fs.readdirSync(blogDir)

    const posts = files.map((filename) => {
        const filePath = path.join(blogDir, filename)
        const fileContents = fs.readFileSync(filePath, 'utf8')
        const { data } = matter(fileContents)
        return {
            url: `https://rishigurjar.com/blog/${generateSlug(data.title)}`,
            lastModified: new Date(data.date),
            changeFrequency: 'monthly' as const,
            priority: 0.8
        }
    })

    // Add other important pages
    const pages = [
        {
            url: 'https://rishigurjar.com',
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 1
        },
        {
            url: 'https://rishigurjar.com/blog',
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9
        }
    ]

    return [...pages, ...posts]
} 