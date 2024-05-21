const express = require('express');
const newsModel = require('./models/newsModel');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// GET endpoint to fetch all news articles
app.get('/api/news', async (req, res) => {
    try {
        const news = await newsModel.getNews();
        res.json(news);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
