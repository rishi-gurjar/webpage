import chokidar from 'chokidar';
import { BLOG_DIR } from '../config';
import {
    runPublishFlow,
    runPrivateFlow,
    askForConfirmation,
    ensureGitignored,
    isGitTracked,
    isIgnoredByGit,
    hasUncommittedGitignore,
} from '../services/publishPost';
import { commitAndPushToGit } from '../services/gitService';
import { exec } from 'child_process';
import matter from 'gray-matter';
import path from 'path';
import fs from 'fs';

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

function repoRel(p: string): string {
    return path.relative(process.cwd(), p).split(path.sep).join('/');
}

// Open a real Terminal window running the interactive flow — used when the
// server runs headless as a LaunchAgent and has no TTY for prompts.
function popTerminal(filePath: string, isPrivate: boolean) {
    const repo = process.cwd();
    const escaped = filePath.replace(/'/g, "'\\''");
    const flag = isPrivate ? '--private ' : '';
    const cmd = `cd ${repo} && npm run publish-post -- ${flag}'${escaped}'`;
    const script =
        `osascript -e 'tell application "Terminal" to do script "${cmd.replace(/"/g, '\\"')}"' ` +
        `-e 'tell application "Terminal" to activate'`;
    exec(script, (err) => {
        if (err) {
            console.error('Failed to open Terminal for publish prompt:', err);
            console.log(`To run manually: npm run publish-post -- ${flag}"${filePath}"`);
        } else {
            console.log(`Opened Terminal publish prompt for ${path.basename(filePath)}`);
        }
    });
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
        // Handle markdown files under blog-content only
        if (path.extname(filePath) !== '.md' || !filePath.startsWith(BLOG_DIR)) return;

        const { data } = matter(fs.readFileSync(filePath, 'utf8'));

        // Private posts: gitignore immediately (protection first), then only
        // ask about pushing the .gitignore update — never commit the post, never email.
        if (data.private === true) {
            const changed = await ensureGitignored(filePath);
            console.log(`🔒 Private post detected — gitignored: ${path.basename(filePath)}`);
            if (process.stdin.isTTY) {
                await runPrivateFlow(filePath);
            } else if (changed || await hasUncommittedGitignore()) {
                popTerminal(filePath, true);
            }
            return;
        }

        if (!hasTodaysDate(filePath)) return;

        // Daemon restarts re-fire 'add' for existing files — skip already-published posts
        if (await isGitTracked(repoRel(filePath))) {
            console.log('Already published, skipping prompt:', path.basename(filePath));
            return;
        }

        if (process.stdin.isTTY) {
            await runPublishFlow(filePath);
        } else {
            popTerminal(filePath, false);
        }
    });

    watcher.on('change', async (filePath: string) => {
        // A blog post gaining/losing the private flag after creation
        if (path.extname(filePath) === '.md' && filePath.startsWith(BLOG_DIR)) {
            const { data } = matter(fs.readFileSync(filePath, 'utf8'));
            if (data.private === true) {
                const changed = await ensureGitignored(filePath);
                console.log(`🔒 ${path.basename(filePath)} marked private — gitignored`);
                if (changed) {
                    if (process.stdin.isTTY) {
                        await runPrivateFlow(filePath);
                    } else {
                        popTerminal(filePath, true);
                    }
                }
            } else if (await isIgnoredByGit(repoRel(filePath))) {
                console.log(`⚠ ${path.basename(filePath)} is no longer private — remove it from .gitignore to publish`);
            }
            return;
        }

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
