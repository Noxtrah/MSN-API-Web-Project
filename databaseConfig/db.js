const sql = require('mssql');

async function sqlConnect() {
    try {
        const pool = await sql.connect({
            server: process.env.DB_SERVER,
            database: process.env.DB_DATABASE,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            options: {
                encrypt: true   // If using Azure SQL, set to true
            }
        });
        return pool;
    } catch (err) {
        console.error('Error connecting to the database:', err);
        throw err;
    }
}

module.exports = sqlConnect;
