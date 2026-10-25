import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BLOG_DIR } from '../config';

// Self-contained copies of src/lib utils — the server tsconfig (rootDir: src/server)
// can't import from src/lib, and ESM-only packages (remark) can't be required here,
// so markdown is shipped raw and rendered client-side with react-markdown.

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[\(\)\?\[\]]/g, '')
        .replace(/[^a-z0-9-\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '');
}

export interface PrivatePostMeta {
    slug: string;
    title: string;
    date: string;
    isPrivate: true;
}

export interface PrivatePost extends PrivatePostMeta {
    content: string;
    headerImage?: string;
    imageAuthor?: string;
    imageLink?: string;
}

function listPrivateFiles(): string[] {
    return fs.readdirSync(BLOG_DIR).filter(filename => {
        const filePath = path.join(BLOG_DIR, filename);
        try {
            if (!fs.statSync(filePath).isFile()) return false;
            const { data } = matter(fs.readFileSync(filePath, 'utf8'));
            return data.private === true;
        } catch {
            return false;
        }
    });
}

export function getPrivatePostsMeta(): PrivatePostMeta[] {
    return listPrivateFiles()
        .map(filename => {
            const { data } = matter(fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8'));
            return {
                slug: generateSlug(data.title),
                title: data.title,
                date: data.date,
                isPrivate: true as const,
            };
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPrivatePost(slug: string): PrivatePost | null {
    for (const filename of listPrivateFiles()) {
        const filePath = path.join(BLOG_DIR, filename);
        const { data, content } = matter(fs.readFileSync(filePath, 'utf8'));
        if (generateSlug(data.title) !== slug) continue;

        // Same cleanup + image-path rewriting as src/app/blog/[slug]/page.tsx
        const cleanContent = content
            .replace(/\\\n/g, '\n\n')
            .replace(/\\$/gm, '')
            .replace(/^(\d+)\.\s*/gm, '$1. ')
            .replace(/\n\n\n+/g, '\n\n')
            .replace(/\[([^\]]+)\]\(([^)]+?)\s+/g, '[$1]($2')
            .replace(/\s+\)/g, ')')
            .replace(/!\[(.*?)\]\(\/([^)]+)\)/g, '![$1](/blog-images/$2)');

        return {
            slug,
            title: data.title,
            date: data.date,
            isPrivate: true,
            content: cleanContent,
            headerImage: data.headerImage,
            imageAuthor: data.imageAuthor,
            imageLink: data.imageLink,
        };
    }
    return null;
}
