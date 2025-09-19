import chokidar from 'chokidar';
import { BLOG_DIR } from '../config';
import { commitAndPushToGit, commitImageFile } from '../services/gitService';
import { sendEmails } from '../services/emailService';
import matter from 'gray-matter';
import path from 'path';
import fs from 'fs';
import readline from 'readline';

// Removed previous quotes tracking - now we detect quotes ready for metadata by the trailing "|"

interface Quote {
    text: string;
    author: string;
    source: string;
    timestamp?: string;
}



function parseQuotes(filePath: string): Quote[] {
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const quotes: Quote[] = [];
        
        fileContents
            .split('\n')
            .filter(line => line.trim() && line.includes('|'))
            .forEach(line => {
                const parts = line.split('|').map(part => part.trim());
                if (parts.length >= 3) {
                    quotes.push({
                        text: parts[0],
                        author: parts[1],
                        source: parts[2],
                        timestamp: parts[3] || undefined
                    });
                }
            });
            
        return quotes;
    } catch (error) {
        console.error('Error reading quotes file:', error);
        return [];
    }
}

const QUOTE_READY_RE = /^\s*([^|]+)\|([^|]+)\|([^|]+)\|\s*$/;

async function processQuotesNeedingMetadata(filePath: string, lineIndices: number[]): Promise<Quote[]> {
    try {
        const timestamp = new Date().toISOString();
        
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const lines = fileContents.split('\n');
        
        const processedQuotes: Quote[] = [];
        
        // Update only the specific lines we detected as ready using a robust regex
        const updatedLines = lines.map((line, idx) => {
            if (!lineIndices.includes(idx)) return line;
            const match = line.match(QUOTE_READY_RE);
            if (!match) return line;
            const text = match[1].trim();
            const author = match[2].trim();
            const source = match[3].trim();
            const updatedLine = `${text} | ${author} | ${source} | ${timestamp}`;
            processedQuotes.push({ text, author, source, timestamp });
            return updatedLine;
        });
        
        fs.writeFileSync(filePath, updatedLines.join('\n'));
        console.log('✓ Added timestamp metadata to quotes');
        
        return processedQuotes;
    } catch (error) {
        console.error('Error processing quotes metadata:', error);
        return [];
    }
}

function findQuotesNeedingMetadata(filePath: string): number[] {
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const lines = fileContents.split('\n');
        const indices: number[] = [];
        lines.forEach((line, idx) => {
            const match = line.match(QUOTE_READY_RE);
            if (match) {
                const [_, a, b, c] = match;
                if (a.trim().length > 0 && b.trim().length > 0 && c.trim().length > 0) {
                    indices.push(idx);
                }
            }
        });
        return indices;
    } catch (error) {
        console.error('Error reading quotes file:', error);
        return [];
    }
}

function displayQuote(quote: Quote): void {
    console.log('\n📝 New quote detected:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`"${quote.text}"`);
    console.log(`   — ${quote.author}${quote.source ? `, ${quote.source}` : ''}`);
    if (quote.timestamp) {
        console.log(`   📅 ${new Date(quote.timestamp).toLocaleString()}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

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

async function updateHeaderImagesInPage(imagePath: string) {
    const pageFilePath = path.join(process.cwd(), 'src/app/blog/[slug]/page.tsx');
    let content = fs.readFileSync(pageFilePath, 'utf8');
    
    const imageName = path.basename(imagePath);
    const imageNameWithoutExt = path.parse(imageName).name;
    
    // Check if image is already in the imports or headerImages
    if (content.includes(`/${imageName}'`)) {
        console.log('✓ Image already registered in page.tsx');
        return;
    }

    try {
        // Find the last image import
        const lastImportIndex = content.lastIndexOf("import") 
        const importEndIndex = content.indexOf('\n', lastImportIndex);
        
        // Add new import
        const newImport = `import ${imageNameWithoutExt}Img from '/public/${imageName}';\n`;
        content = content.slice(0, importEndIndex + 1) + newImport + content.slice(importEndIndex + 1);

        // Find headerImages object
        const headerImagesStart = content.indexOf('const headerImages');
        const headerImagesEnd = content.indexOf('};', headerImagesStart);
        
        // Add new entry to headerImages
        const newEntry = `  '/${imageName}': ${imageNameWithoutExt}Img,\n`;
        content = content.slice(0, headerImagesEnd) + newEntry + content.slice(headerImagesEnd);

        // Write changes back to file
        fs.writeFileSync(pageFilePath, content);
        console.log('✓ Added image to page.tsx imports and headerImages');
    } catch (error) {
        console.error('Error updating page.tsx:', error);
    }
}

export function setupBlogWatcher() {
    const publicDir = path.join(process.cwd(), 'public');
    const quotesFile = path.join(process.cwd(), 'src/quote-wall/quotes.md');
    
    // Quotes watcher will detect quotes ending with "|" for metadata processing
    
    const watcher = chokidar.watch([BLOG_DIR, publicDir, quotesFile], {
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
                    await updateHeaderImagesInPage(matchingImagePath);
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

    watcher.on('change', async (filePath: string) => {
        // Handle changes to quotes.md
        if (path.basename(filePath) === 'quotes.md') {
            console.log('Quotes file changed:', path.basename(filePath));
            
            const quotesNeedingMetadata = findQuotesNeedingMetadata(filePath);
            
            if (quotesNeedingMetadata.length > 0) {
                console.log(`Found ${quotesNeedingMetadata.length} quote(s) ready for metadata...`);
                
                // Process quotes that end with "|" and add metadata
                const processedQuotes = await processQuotesNeedingMetadata(filePath, quotesNeedingMetadata);
                
                for (const processedQuote of processedQuotes) {
                    displayQuote(processedQuote);
                    
                    const shouldProceed = await askForConfirmation(
                        `Do you want to commit and push this quote to git?`
                    );

                    if (shouldProceed === 'y' || shouldProceed === 'yes') {
                        try {
                            await commitAndPushToGit(filePath);
                            console.log('✓ Quote committed and pushed to git successfully');
                        } catch (error) {
                            console.error('Error committing quote:', error);
                        }
                    } else {
                        console.log('Quote commit cancelled');
                    }
                }
            }
        }
    });

    watcher.on('ready', () => {
        console.log('Initial scan complete. Ready for changes');
        console.log('Watching for blog posts and quotes...');
    });

    watcher.on('error', error => {
        console.error('Watcher error:', error);
    });
} 