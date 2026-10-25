import path from 'path';
import dotenv from 'dotenv';
import { runPublishFlow, runPrivateFlow } from './services/publishPost';

dotenv.config();

(async () => {
    const args = process.argv.slice(2);
    const isPrivate = args[0] === '--private';
    const file = isPrivate ? args[1] : args[0];
    if (!file) {
        console.error('Usage: npm run publish-post -- [--private] <markdown-file>');
        process.exit(1);
    }
    if (isPrivate) {
        await runPrivateFlow(path.resolve(file));
    } else {
        await runPublishFlow(path.resolve(file));
    }
    process.exit(0);
})();
