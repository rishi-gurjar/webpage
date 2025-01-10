import express from 'express';
import cors from 'cors';
import { PORT } from './config';
import apiRoutes from './routes/api';
import { setupBlogWatcher } from './watchers/blogWatcher';
import { computeTotalSleep } from './services/v9Service';

const app = express();

app.use(cors());
app.use(express.text());
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use('/api', apiRoutes);

// Wrap the async call in an IIFE
(async () => {
    try {
        setupBlogWatcher();
        setInterval(async () => {
            await computeTotalSleep();
        }, 1000 * 60 * 60); // update sleep hours hourly
    } catch (error) {
        console.error("Error during startup:", error);
    }
})();

app.listen(PORT, () => {
    console.log(`\n=== Server Started ===`);
    console.log(`Time: ${new Date()}`);
    console.log(`Port: ${PORT}`);
    console.log(`Watching /blog-content for new posts...`);
    console.log('========================\n');
});