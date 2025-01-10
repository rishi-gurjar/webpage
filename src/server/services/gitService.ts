import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

async function retry<T>(
    operation: () => Promise<T>,
    retries: number = 3,
    delay: number = 2000
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (retries === 0) throw error;
        console.log(`Operation failed, retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(operation, retries - 1, delay * 1.5);
    }
}

export async function commitAndPushToGit(filePath: string): Promise<void> {
    try {
        const fileName = path.basename(filePath);

        await execAsync(`git add "${filePath}"`);
        await execAsync(`git commit -m "Add new blog post: ${fileName}"`);

        await retry(async () => {
            try {
                await execAsync('ping -c 1 github.com');
                const { stdout, stderr } = await execAsync('git push origin main');
                if (stderr && !stderr.includes('Everything up-to-date')) {
                    console.error(`Git stderr: ${stderr}`);
                }
                if (stdout) console.log(`Git stdout: ${stdout}`);
            } catch (error) {
                console.error('Network or Git error:', error);
                throw error;
            }
        });

        console.log('Successfully committed and pushed to Git');
    } catch (error) {
        console.error('Error in Git operations:', error);
        console.log('Changes committed locally. Please push manually when connection is restored.');
        return;
    }
}

export async function commitImageFile(imagePath: string): Promise<void> {
    try {
        await execAsync(`git add "${imagePath}"`);
        await execAsync(`git commit -m "Add blog header image: ${path.basename(imagePath)}"`);

        await retry(async () => {
            try {
                await execAsync('ping -c 1 github.com');
                await execAsync('git push origin main');
            } catch (error) {
                console.error('Network or Git error:', error);
                throw error;
            }
        });

        console.log(`Successfully committed image: ${imagePath}`);
    } catch (error) {
        console.error(`Error committing image: ${error}`);
        console.log('Image committed locally. Please push manually when connection is restored.');
        return;
    }
} 