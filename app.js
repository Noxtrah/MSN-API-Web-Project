//app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
require('./auth');

const app = express();

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Authenticate with Google</a>');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: [ 'email', 'profile' ] }
));

// app.get( '/auth/google/callback',
//   passport.authenticate( 'google', {
//     successRedirect: '/protected',
//     failureRedirect: '/auth/google/failure'
//   })
// );

app.get('/auth/google/callback',
  (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect('/auth/google/failure');
      }
      // Construct the redirect URL with user data
      const redirectUrl = 'http://localhost:3000?user=' + encodeURIComponent(JSON.stringify(user));
      // Redirect to the client-side application
      res.redirect(redirectUrl);
    })(req, res, next);
  }
);

app.get('/protected', isLoggedIn, (req, res) => {
  res.json(req.user);
});

app.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('Goodbye!');
});

app.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..');
});

app.use(require('./routes/routes'));

const server = http.createServer(app); // Create an HTTP server with the Express app

require('./wsServer')(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
