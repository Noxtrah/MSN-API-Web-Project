//models/newsModel.js
const sql = require('mssql');
const sqlConnect = require('../databaseConfig/db');
const { get } = require('../routes/routes');



// Function to get news
// async function getNews() {
//     try {
//         const pool = await sqlConnect();
//         const result = await pool.request().query('SELECT * FROM News');
//         console.log('News fetched successfully:', result.recordset);
//         return result.recordset;
//     } catch (err) {
//         console.error('Error fetching news:', err);
//         throw err;
//     }
// }

// async function getNews(language) {
//     try {
//       const pool = await sqlConnect();
//       let query = '';
  
//       // Construct SQL query based on language parameter
//       if (language && language.toLowerCase() === 'tr' || language.toLowerCase() === 'turkish') {
//         query = 'SELECT * FROM NewsTR';
//       } else {
//         query = 'SELECT * FROM News';
//       }
  
//       const result = await pool.request().query(query);
//       console.log('News fetched successfully:', result.recordset);
//       return result.recordset;
//     } catch (err) {
//       console.error('Error fetching news:', err);
//       throw err;
//     }
//   }

async function getNews(language, userID) {
    try {
        const pool = await sqlConnect();
        
        // Determine which table to use based on the language
        const newsTable = language === 'tr' ? 'NewsTR' : 'News';

        let query = `
            SELECT ${newsTable}.*,
                CASE WHEN EXISTS (SELECT 1 FROM ContentInteractions WHERE ContentID = ${newsTable}.NewsID AND UserID = @UserID AND InteractionType = 'like') THEN 1 ELSE 0 END AS isLiked,
                CASE WHEN EXISTS (SELECT 1 FROM ContentInteractions WHERE ContentID = ${newsTable}.NewsID AND UserID = @UserID AND InteractionType = 'dislike') THEN 1 ELSE 0 END AS isDisliked
            FROM ${newsTable}`;

        const result = await pool.request()
            .input('UserID', sql.NVarChar, userID)
            .query(query);

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
            .input('UserID', sql.NVarChar, userId) //for google this would be sub value
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

        await pool.request()
            .input('NewsID', sql.Int, newsId)
            .query('UPDATE NewsTR SET Like_count = Like_count + 1 WHERE NewsID = @NewsID');

        // Optionally, you can also log the interaction in ContentInteractions
        await pool.request()
            .input('UserID', sql.NVarChar, userId)
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
            .input('UserID', sql.NVarChar, userId)
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

        await pool.request()
            .input('NewsID', sql.Int, newsId)
            .query('UPDATE newsTR SET Dislike_count = Dislike_count + 1 WHERE NewsID = @NewsID');

        // Log the interaction in ContentInteractions
        await pool.request()
            .input('UserID', sql.NVarChar, userId)
            .input('ContentID', sql.Int, newsId)
            .input('InteractionType', sql.NVarChar, 'dislike')
            .query('INSERT INTO ContentInteractions (UserID, ContentID, InteractionType) VALUES (@UserID, @ContentID, @InteractionType)');

        // Return success response
        return { success: 'Content disliked successfully' };
    } catch (error) {
        throw error;
    }
}

async function getUserPreferences(userId, pool, language) {
    try {
        let procedureName = 'GetUserPreferences'; // Default stored procedure name

        // Determine the stored procedure based on the language parameter
        if (language && language.toLowerCase() === 'tr' || language.toLowerCase() === 'turkish') {
            procedureName = 'GetUserPreferencesTR'; // Use TR version for Turkish
        }

        // Execute the selected stored procedure
        const result = await pool.request()
            .input('UserID', sql.NVarChar, userId)
            .execute(procedureName);

        return result.recordset;
    } catch (err) {
        console.error('Error fetching user preferences:', err);
        throw err;
    }
}

async function recommendNews(userId, pool, language) {
    try {
        const preferences = await getUserPreferences(userId, pool, language);

        if (preferences.length === 0) {
            // No preferences found, call the stored procedure for default recommendations
            const result = await pool.request().execute('GetTopNewsOrderedByLikes');
            return result.recordset;
        }

        // Get top preferred category
        const topCategory = preferences[0].Category;

        // Recommend news from the top preferred category
        if(language && language.toLowerCase() === 'tr' || language.toLowerCase() === 'turkish'){
            const result = await pool.request()
            .input('Category', sql.NVarChar, topCategory)
            .query('SELECT TOP 10 * FROM NewsTR WHERE Category = @Category ORDER BY NEWID()');
            return result.recordset;
        }
        else if (language && language.toLowerCase() === 'en' || language.toLowerCase() === 'english'){
            const result = await pool.request()
            .input('Category', sql.NVarChar, topCategory)
            .query('SELECT TOP 10 * FROM News WHERE Category = @Category ORDER BY NEWID()');
            return result.recordset;

        }

        return result.recordset;
    } catch (err) {
        console.error('Error recommending news:', err);
        throw err;
    }
}

async function getNewestNews(pool) {
    try {
        // Execute a SQL query to retrieve the newest news data
        const result = await pool.request().query('SELECT TOP 5 * FROM News ORDER BY Insertion_hour DESC');

        // Extract the data from the SQL result
        const newestNewsData = result.recordset;

        return newestNewsData;
    } catch (error) {
        console.error('Error fetching newest news data:', error);
        throw error;
    }
}

async function getCategorizedNews(category) {
    try {
        const pool = await sqlConnect();
        const request = pool.request();
        request.input('category', sql.NVarChar, category);
        const result = await request.query('SELECT * FROM [dbo].[News] WHERE [Category] = @Category');
        return result.recordset;
    } catch (error) {
        console.error('Error fetching categorized news:', error);
        throw error;
    }
}

async function getSearchedNews(searchQuery) {
    try {
        const pool = await sqlConnect();
        const request = pool.request();
        request.input('SearchQuery', sql.NVarChar, searchQuery);
        const result = await request.execute('SearchNews');
        return result.recordset;
    } catch (error) {
        console.error('Error fetching searched news:', error);
        throw error;
    }
}

module.exports = {
    getNews,
    likeNews,
    dislikeNews,
    recommendNews,
    getNewestNews,
    getCategorizedNews,
    getSearchedNews
};
