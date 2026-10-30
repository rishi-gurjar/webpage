import fs from 'fs';
import os from 'os';
import path from 'path';
import matter from 'gray-matter';
import readline from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';
import { commitAndPushToGit, commitAndPushFile, commitImageFile } from './gitService';
import { sendEmails } from './emailService';

const execAsync = promisify(exec);
const GITIGNORE_PATH = path.join(process.cwd(), '.gitignore');
const PRIVATE_MARKER = '# Private blog posts';

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

// The interactive publish flow for a public blog post: header image registration,
// commit/push prompt, then email prompt. Requires a TTY on stdin.
export async function runPublishFlow(filePath: string): Promise<void> {
    const publicDir = path.join(process.cwd(), 'public');
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

    if (shouldProceed !== 'y' && shouldProceed !== 'yes') {
        console.log('Blog post processing cancelled');
        return;
    }

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
}

// ---------------------------------------------------------------------------
// Private posts (frontmatter `private: true`): gitignore + optional push, never
// commit the post itself, never email.

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function repoRel(p: string): string {
    return path.relative(process.cwd(), p).split(path.sep).join('/');
}

export async function isGitTracked(relPath: string): Promise<boolean> {
    try {
        await execAsync(`git ls-files --error-unmatch "${relPath}"`);
        return true;
    } catch {
        return false;
    }
}

export async function isIgnoredByGit(relPath: string): Promise<boolean> {
    try {
        await execAsync(`git check-ignore "${relPath}"`);
        return true;
    } catch {
        return false;
    }
}

// Add a private post (and any public/ images it references) to .gitignore, and
// untrack anything that was already committed. Returns true if anything changed.
export async function ensureGitignored(mdFilePath: string): Promise<boolean> {
    let changed = false;
    const entries = new Set<string>([repoRel(mdFilePath)]);

    // Referenced images under public/ must stay local too
    const { data, content } = matter(fs.readFileSync(mdFilePath, 'utf8'));
    const publicDir = path.join(process.cwd(), 'public');
    const refs: string[] = [];
    if (typeof data.headerImage === 'string') refs.push(data.headerImage);
    const imgRe = /!\[[^\]]*\]\((\/[^)\s]+)\)/g;
    let m: RegExpExecArray | null;
    while ((m = imgRe.exec(content)) !== null) refs.push(m[1]);
    for (const ref of refs) {
        const rel = ref.replace(/^\/+/, '');
        // inline images resolve under public/blog-images/, headerImage under public/
        for (const cand of [path.join(publicDir, rel), path.join(publicDir, 'blog-images', rel)]) {
            if (fs.existsSync(cand)) {
                entries.add(repoRel(cand));
                break;
            }
        }
    }

    let gitignore = fs.existsSync(GITIGNORE_PATH) ? fs.readFileSync(GITIGNORE_PATH, 'utf8') : '';
    if (!gitignore.includes(PRIVATE_MARKER)) {
        gitignore += `\n${PRIVATE_MARKER}\n`;
        changed = true;
    }
    for (const entry of entries) {
        if (!new RegExp(`^${escapeRegExp(entry)}$`, 'm').test(gitignore)) {
            gitignore += `${entry}\n`;
            changed = true;
        }
    }
    if (changed) fs.writeFileSync(GITIGNORE_PATH, gitignore);

    const mdRel = repoRel(mdFilePath);
    for (const entry of entries) {
        if (!(await isGitTracked(entry))) continue;
        if (entry === mdRel) {
            // untrack the post itself — it must not exist in the repo
            await execAsync(`git rm --cached "${entry}"`);
            console.log(`Untracked ${entry} (kept locally) — still in git history if previously committed`);
            changed = true;
        } else {
            // an already-committed image may be shared with public posts —
            // untracking it would break them, so just warn
            console.log(`⚠ ${entry} is already tracked and public — it can't be un-published`);
        }
    }
    return changed;
}

export async function hasUncommittedGitignore(): Promise<boolean> {
    try {
        const { stdout } = await execAsync(`git status --porcelain .gitignore`);
        return stdout.trim().length > 0;
    } catch {
        return false;
    }
}

// Backup: copy the post + its un-committed (private) images into a local clone
// of the `privateblogs` repo and push — private posts never enter the public
// repo, so this keeps them safe.
const PRIVATEBLOGS_DIR = process.env.PRIVATEBLOGS_DIR
    || path.join(os.homedir(), 'Documents/GitHub/privateblogs');
const PRIVATEBLOGS_REPO = 'rishi-gurjar/privateblogs';

export async function backupPrivatePost(mdFilePath: string): Promise<void> {
    if (!fs.existsSync(path.join(PRIVATEBLOGS_DIR, '.git'))) {
        console.log(`Cloning ${PRIVATEBLOGS_REPO} into ${PRIVATEBLOGS_DIR}…`);
        try {
            await execAsync(`gh repo clone ${PRIVATEBLOGS_REPO} "${PRIVATEBLOGS_DIR}"`);
        } catch (e) {
            console.error('Could not clone privateblogs (set PRIVATEBLOGS_DIR to a local clone):', e);
            return;
        }
    }

    const copies: string[] = [path.basename(mdFilePath)];
    fs.copyFileSync(mdFilePath, path.join(PRIVATEBLOGS_DIR, path.basename(mdFilePath)));

    // Referenced images get copied only if not committed to the public repo —
    // tracked images are already backed up there.
    const { data, content } = matter(fs.readFileSync(mdFilePath, 'utf8'));
    const publicDir = path.join(process.cwd(), 'public');
    const refs: string[] = [];
    if (typeof data.headerImage === 'string') refs.push(data.headerImage);
    const imgRe = /!\[[^\]]*\]\((\/[^)\s]+)\)/g;
    let m: RegExpExecArray | null;
    while ((m = imgRe.exec(content)) !== null) refs.push(m[1]);
    for (const ref of refs) {
        const rel = ref.replace(/^\/+/, '');
        for (const cand of [path.join(publicDir, rel), path.join(publicDir, 'blog-images', rel)]) {
            if (!fs.existsSync(cand)) continue;
            const candRel = repoRel(cand);
            if (await isGitTracked(candRel)) break;
            const dest = path.join(PRIVATEBLOGS_DIR, candRel);
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.copyFileSync(cand, dest);
            copies.push(candRel);
            break;
        }
    }

    try {
        await execAsync(`git -C "${PRIVATEBLOGS_DIR}" add -A`);
        const { stdout: status } = await execAsync(`git -C "${PRIVATEBLOGS_DIR}" status --porcelain`);
        if (!status.trim()) {
            console.log('privateblogs already up to date');
            return;
        }
        await execAsync(`git -C "${PRIVATEBLOGS_DIR}" commit -m "Back up ${path.basename(mdFilePath)}"`);
        await execAsync(`git -C "${PRIVATEBLOGS_DIR}" push`);
        console.log(`✓ Backed up to privateblogs: ${copies.join(', ')}`);
    } catch (e) {
        console.error('Backup to privateblogs failed:', e);
    }
}

// Private flow: post is already gitignored — only ask whether to push that
// update. No commit of the post, no email.
export async function runPrivateFlow(filePath: string): Promise<void> {
    await ensureGitignored(filePath);
    console.log(`🔒 Private post "${path.basename(filePath)}" stays local — never committed, never emailed.`);

    if (!(await hasUncommittedGitignore())) {
        console.log('No .gitignore changes to push.');
        return;
    }

    const shouldPush = await askForConfirmation(
        `Do you want to commit and push the .gitignore update?`
    );

    if (shouldPush === 'y' || shouldPush === 'yes') {
        try {
            await commitAndPushFile('.gitignore', `Gitignore private post: ${path.basename(filePath)}`);
            console.log('✓ Pushed .gitignore update');
        } catch (error) {
            console.error('Error pushing .gitignore update:', error);
        }
    } else {
        console.log('Skipped — .gitignore changes remain uncommitted');
    }

    const shouldBackup = await askForConfirmation(
        `Back up "${path.basename(filePath)}" to privateblogs?`
    );
    if (shouldBackup === 'y' || shouldBackup === 'yes') {
        await backupPrivatePost(filePath);
    }
}
