//models/newsModel.js
const sql = require('mssql');
const sqlConnect = require('../databaseConfig/db');



// Function to get news
async function getNews() {
    try {
        const pool = await sqlConnect();
        const result = await pool.request().query('SELECT * FROM News');
        console.log('News fetched successfully:', result.recordset);
        return result.recordset;
    } catch (err) {
        console.error('Error fetching news:', err);
        throw err;
    }
}

async function likeNews(userId, newsId, pool) {
    try {
        const likeCheckResult = await pool.request()
            .input('UserID', sql.Int, userId)
            .input('ContentID', sql.Int, newsId)
            .query('SELECT * FROM ContentInteractions WHERE UserID = @UserID AND ContentID = @ContentID AND InteractionType = \'like\'');

        console.log('Like check result:', likeCheckResult.recordset);
        if (likeCheckResult.recordset.length > 0) {
            // User has already liked the content, return a custom error response
            return { error: 'User has already liked this content' };
        }
        console.log('Like news:', userId, newsId);
        // Update the Like_count in the news table
        await pool.request()
            .input('NewsID', sql.Int, newsId)
            .query('UPDATE news SET Like_count = Like_count + 1 WHERE NewsID = @NewsID');

        // Optionally, you can also log the interaction in ContentInteractions
        await pool.request()
            .input('UserID', sql.Int, userId)
            .input('ContentID', sql.Int, newsId)
            .input('InteractionType', sql.NVarChar, 'like')
            .query('INSERT INTO ContentInteractions (UserID, ContentID, InteractionType) VALUES (@UserID, @ContentID, @InteractionType)');

        // Return success response
        return { success: 'Content liked successfully' }; // Change this message
    } catch (error) {
        throw error;
    }
}

async function dislikeNews(userId, newsId, pool) {
    try {
        // Check if the user has already interacted with the content
        const interactionCheckResult = await pool.request()
            .input('UserID', sql.Int, userId)
            .input('ContentID', sql.Int, newsId)
            .query('SELECT * FROM ContentInteractions WHERE UserID = @UserID AND ContentID = @ContentID');

        console.log('Interaction check result:', interactionCheckResult.recordset);
        if (interactionCheckResult.recordset.length > 0) {
            // User has already interacted with the content, return a custom error response
            return { error: 'User has already interacted with this content' };
        }

        // Update the Dislike_count in the news table
        await pool.request()
            .input('NewsID', sql.Int, newsId)
            .query('UPDATE news SET Dislike_count = Dislike_count + 1 WHERE NewsID = @NewsID');

        // Log the interaction in ContentInteractions
        await pool.request()
            .input('UserID', sql.Int, userId)
            .input('ContentID', sql.Int, newsId)
            .input('InteractionType', sql.NVarChar, 'dislike')
            .query('INSERT INTO ContentInteractions (UserID, ContentID, InteractionType) VALUES (@UserID, @ContentID, @InteractionType)');

        // Return success response
        return { success: 'Content disliked successfully' };
    } catch (error) {
        throw error;
    }
}


module.exports = {
    getNews,
    likeNews,
    dislikeNews
};
