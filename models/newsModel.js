const sql = require('mssql');

async function getNews() {
    try {
        await sql.connect({
            server: 'your_server',
            database: 'your_database',
            user: 'your_username',
            password: 'your_password',
            options: {
                encrypt: true   // If using Azure SQL, set to true
            }
        });
        const result = await sql.query`SELECT * FROM News`;
        return result.recordset;
    } catch (err) {
        console.error('Error fetching news:', err);
        throw err;
    }
}

module.exports = {
    getNews
};
