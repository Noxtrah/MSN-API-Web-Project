const sqlConnect = require('../databaseConfig/db');
const sql = require('mssql');

async function getUserByEmail(email) {
    try {
        const pool = await sqlConnect();
        const result = await pool.request()
            .input('UserEmail', sql.VarChar, email)
            .query('SELECT * FROM Users WHERE UserEmail = @UserEmail');
        return result.recordset[0]; // Assuming you expect only one user per email
    } catch (error) {
        console.error('Error in getUserByEmail:', error);
        throw error;
    }
}

module.exports = {
    getUserByEmail
};
