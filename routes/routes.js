const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const sqlConnect = require('../databaseConfig/db');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await sqlConnect();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.request()
              .input('username', sql.VarChar, username)
              .input('password', sql.VarChar, hashedPassword)
              .query('INSERT INTO Users (username, password) VALUES (@username, @password)');

    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Server error');
  }
});

// Login route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });

    req.login(user, { session: false }, (err) => {
      if (err) return next(err);

      const token = jwt.sign({ id: user.id }, 'your_jwt_secret');
      return res.json({ token });
    });
  })(req, res, next);
});

module.exports = router;
