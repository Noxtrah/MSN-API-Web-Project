// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// const bcrypt = require('bcryptjs');
// const sqlConnect = require('./databaseConfig/db');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;


// passport.use(new LocalStrategy(
//   async (username, password, done) => {
//     try {
//       const pool = await sqlConnect();
//       const result = await pool.request()
//                                .input('username', sql.VarChar, username)
//                                .query('SELECT * FROM Users WHERE username = @username');

//       if (result.recordset.length === 0) {
//         return done(null, false, { message: 'Incorrect username.' });
//       }

//       const user = result.recordset[0];
//       const isMatch = await bcrypt.compare(password, user.password);

//       if (isMatch) {
//         return done(null, user);
//       } else {
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//     } catch (err) {
//       return done(err);
//     }
//   }
// ));

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const pool = await sqlConnect();
//     const result = await pool.request()
//                              .input('id', sql.Int, id)
//                              .query('SELECT * FROM Users WHERE id = @id');

//     if (result.recordset.length === 0) {
//       return done(new Error('User not found'));
//     }

//     done(null, result.recordset[0]);
//   } catch (err) {
//     done(err);
//   }
// });

// // Add to passport use section in auth.js
// passport.use(new GoogleStrategy({
//     clientID: 'your_google_client_id',
//     clientSecret: 'your_google_client_secret',
//     callbackURL: '/auth/google/callback'
//   },
//   async (token, tokenSecret, profile, done) => {
//     try {
//       const pool = await sqlConnect();
//       let result = await pool.request()
//                              .input('googleId', sql.VarChar, profile.id)
//                              .query('SELECT * FROM Users WHERE googleId = @googleId');
      
//       if (result.recordset.length === 0) {
//         await pool.request()
//                   .input('googleId', sql.VarChar, profile.id)
//                   .input('username', sql.VarChar, profile.displayName)
//                   .query('INSERT INTO Users (googleId, username) VALUES (@googleId, @username)');
        
//         result = await pool.request()
//                            .input('googleId', sql.VarChar, profile.id)
//                            .query('SELECT * FROM Users WHERE googleId = @googleId');
//       }
  
//       return done(null, result.recordset[0]);
//     } catch (err) {
//       return done(err);
//     }
//   }));
  
//   // Add routes in routes.js
//   router.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));
  
//   router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
//     const token = jwt.sign({ id: req.user.id }, 'your_jwt_secret');
//     res.redirect(`/welcome?token=${token}`);
//   });

const passport = require('passport');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback",
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
