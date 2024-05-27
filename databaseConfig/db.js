const sql = require('mssql');

async function sqlConnect() {
    try {
        const pool = await sql.connect({
            server: 'your_server',
            database: 'your_database',
            user: 'your_username',
            password: 'your_password',
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
