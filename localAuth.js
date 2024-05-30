// const sql = require('mssql');
// const  {sqlConnect} = require('./databaseConfig/db');

// async function getUserByEmail(email) {
//     try {
//         const pool = await sqlConnect(); // Get the database connection pool
//         const result = await pool.request()
//             .input('UserEmail', sql.VarChar, email)
//             .query('SELECT * FROM Users WHERE UserEmail = @UserEmail');
//         console.log(result.recordset[0]);
//         return result.recordset[0]; // Assuming you expect only one user per email
//     } catch (error) {
//         throw error;
//     }
// }

// module.exports = {
//     getUserByEmail
// };
