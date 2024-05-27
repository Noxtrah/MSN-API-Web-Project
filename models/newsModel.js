const sql = require('mssql');
const sqlConnect = require('./databaseConfig/db');



// Function to get news
async function getNews() {
    try {
        const pool = await sqlConnect();
        const result = await pool.request().query('SELECT * FROM News');
        return result.recordset;
    } catch (err) {
        console.error('Error fetching news:', err);
        throw err;
    }
}

module.exports = {
    getNews
};
