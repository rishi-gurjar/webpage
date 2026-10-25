import dotenv from 'dotenv';
import { setupBlogWatcher } from './watchers/blogWatcher';

dotenv.config();

// Foreground watcher — prompts run in this terminal (unlike the headless daemon,
// which pops open a Terminal window instead).
setupBlogWatcher();
console.log('Blog watcher running in foreground...');
