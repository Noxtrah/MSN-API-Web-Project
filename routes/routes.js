//routes/routes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const sql = require('mssql');
const sqlConnect = require('../databaseConfig/db');
const { getNews } = require('../models/newsModel');
// const jwtSecret = require('crypto').randomBytes(64).toString('hex');
const { getUserByEmail } = require('../models/userModel');
const { recommendNews, likeNews, dislikeNews, getCategorizedNews, getSearchedNews } = require('../models/newsModel');

const router = express.Router();

// Middleware to authenticate user and get user ID from the token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('Token not found');
    return res.sendStatus(401);
  }

  const jwtSecret = process.env.JWT_SECRET;
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

// Register route
router.post('/register', async (req, res) => {
  const { firstName, lastName, userEmail, password, country, city } = req.body;

  try {
    const pool = await sqlConnect();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.request()
              .input('FirstName', sql.VarChar, firstName)
              .input('LastName', sql.VarChar, lastName)
              .input('UserEmail', sql.VarChar, userEmail)
              .input('Password', sql.VarChar, hashedPassword)
              .input('Country', sql.VarChar, country)
              .input('City', sql.VarChar, city)
              .query('INSERT INTO Users (FirstName, LastName, UserEmail, Password, Country, City) VALUES (@FirstName, @LastName, @UserEmail, @Password, @Country, @City)');

    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Server error');
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { userEmail, password } = req.body;

  try {
    // Query your database to find the user by email
    const user = await getUserByEmail(userEmail);

    // If user not found, return error
    if (!user) {
      return res.status(400).json({ message: 'Incorrect email or password.' });
    }

    console.log("User password: " , user.Password);
    // Check password hash
    const isMatch = await bcrypt.compare(password, user.Password); // Compare passwords
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect email or password.' });
    }

    // If user is found and password is correct, generate JWT token
    const jwtSecret = process.env.JWT_SECRET; // Replace with your actual JWT secret from environment variable
    const token = jwt.sign({ id: user.ID }, jwtSecret);
    console.log("Token: " , token);

    // Return the JWT token
    return res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/news/like', async (req, res) => {
  const { id, userID } = req.query;
  try {
      console.log("Reqeust" , req.query);
      const pool = await sqlConnect();
      const result = await likeNews(userID, id, pool);
      if (result.error) {
        // User has already liked the news, send appropriate message
        return res.status(400).json({ message: result.error });
      }
      res.status(200).json({ message: 'News liked successfully' });
  } catch (error) {
      console.error('Error liking news:', error);
      res.status(500).send('Server error');
  }
});

// Dislike news route
router.post('/news/dislike', async (req, res) => {
  const { id, userID } = req.query;
  try {
    const { id, userID } = req.query;
      const pool = await sqlConnect();
      const result = await dislikeNews(userID, id, pool);
      if (result.error) {
        // User has already liked the news, send appropriate message
        return res.status(400).json({ message: result.error });
      }
      res.status(200).json({ message: 'News disliked successfully' });
  } catch (error) {
      console.error('Error disliking news:', error);
      res.status(500).send('Server error');
  }
});

// router.get('/news', async (req, res) => {
//   try {
//     const news = await getNews();
//     res.status(200).json(news);
//   } catch (err) {
//     console.error('Error fetching news:', err);
//     res.status(500).send('Server error');
//   }
// });

router.get('/news', async (req, res) => {
  try {
    const language = req.query.language;
    const userId = req.query.userID;
    const news = await getNews(language, userId);
    res.status(200).json(news);
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).send('Server error');
  }
});

router.get('/recommendations', async (req, res) => {
  const { userID } = req.query;
  try {
    const language = req.query.language;
      const pool = await sqlConnect();
      const recommendations = await recommendNews(userID, pool, language);
      res.status(200).json(recommendations);
  } catch (error) {
      console.error('Error getting recommendations:', error);
      res.status(500).send('Server error');
  }
});

router.get('/categorizedNews', async (req, res) => {
  try {
      const category = req.query.category;
      const userId = req.query.userID;
      const language = req.query.language;


      if (!category) {
          return res.status(400).send('Category query parameter is required');
      }
      const news = await getCategorizedNews(category, userId, language);
      res.json(news);
  } catch (error) {
      console.error('Error fetching categorized news:', error);
      res.status(500).send('Internal Server Error');
  }
});

router.get('/searchedNews', async (req, res) => {
  try {
      const searchQuery = req.query.searchQuery;
      const userId = req.query.userID;

      if (!searchQuery) {
          return res.status(400).send('Search query parameter is required');
      }
      const news = await getSearchedNews(searchQuery, userId);
      res.json(news);
  } catch(error) {
      console.error('Error fetching searched news:', error);
      res.status(500).send('Internal Server Error');
  }

})

module.exports = router;
