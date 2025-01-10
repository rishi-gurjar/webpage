import chokidar from 'chokidar';
import { BLOG_DIR } from '../config';
import { commitAndPushToGit, commitImageFile } from '../services/gitService';
import { sendEmails } from '../services/emailService';
import matter from 'gray-matter';
import path from 'path';
import fs from 'fs';
import readline from 'readline';

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export async function askForConfirmation(message: string, allowReprompt: boolean = false): Promise<string> {
    return new Promise((resolve) => {
        const options = allowReprompt ? '(y/n/r)' : '(y/n)';
        rl.question(`${message} ${options}: `, (answer) => {
            resolve(answer.toLowerCase());
        });
    });
}

function hasTodaysDate(filePath: string): boolean {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);
    if (!data.date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const postDate = new Date(data.date);
    postDate.setHours(0, 0, 0, 0);
    postDate.setDate(postDate.getDate() + 1);

    return postDate.getTime() === today.getTime();
}

function findMatchingImage(headerImage: string, publicDir: string): string | null {
    const imageName = path.basename(headerImage.startsWith('/') ? headerImage.slice(1) : headerImage);
    const imageNameWithoutExt = path.parse(imageName).name;
    
    // Look for any matching image with common extensions
    const extensions = ['.png', '.jpg', '.jpeg', '.gif'];
    for (const ext of extensions) {
        const possiblePath = path.join(publicDir, `${imageNameWithoutExt}${ext}`);
        if (fs.existsSync(possiblePath)) {
            return possiblePath;
        }
    }
    return null;
}

export function setupBlogWatcher() {
    const publicDir = path.join(process.cwd(), 'public');
    const watcher = chokidar.watch([BLOG_DIR, publicDir], {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        }
    });

    watcher.on('add', async (filePath: string) => {
        // Handle markdown files
        if (path.extname(filePath) === '.md' && hasTodaysDate(filePath)) {
            console.log('New blog post detected:', path.basename(filePath));
            
            // Check for matching header image
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const { data } = matter(fileContent);
            
            let matchingImagePath: string | null = null;
            
            if (data.headerImage) {
                matchingImagePath = findMatchingImage(data.headerImage, publicDir);
                
                if (matchingImagePath) {
                    console.log(`✓ Matching header image found: ${path.basename(matchingImagePath)}`);
                } else {
                    console.log(`⚠ No matching image found for: ${data.headerImage}`);
                }
            }

            const shouldProceed = await askForConfirmation(
                `Do you want to commit and push to main "${path.basename(filePath)}"?`
            );

            if (shouldProceed === 'y' || shouldProceed === 'yes') {
                try {
                    // If we found a matching image, commit it first
                    if (matchingImagePath) {
                        await commitImageFile(matchingImagePath);
                    }

                    // Then commit the blog post
                    await commitAndPushToGit(filePath);
                    console.log('Git operations completed successfully');

                } catch (error) {
                    console.error('Error processing new blog post:', error);
                }
                const shouldProceed2 = await askForConfirmation(
                    `Do you want to generate the email "${path.basename(filePath)}"?`
                );

                if (shouldProceed2 === 'y') {
                    await sendEmails(filePath);
                }
            } else {
                console.log('Blog post processing cancelled');
            }
        }
    });

    watcher.on('ready', () => {
        console.log('Initial scan complete. Ready for changes');
    });

    watcher.on('error', error => {
        console.error('Watcher error:', error);
    });
} 