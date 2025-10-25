// backend/app.js

const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Allow frontend requests (Nginx proxy or localhost)
app.use(cors());
app.use(bodyParser.json());

// MySQL configuration
const dbConfig = {
  host: 'mysql', // name of MySQL service in docker-compose.yml
  user: 'root',
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: 'healingdb',
};

let pool;

// Initialize database and tables
async function initDb() {
  try {
    pool = await mysql.createPool(dbConfig);

    // Create users table (for main form)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255),
        email VARCHAR(255),
        mobile VARCHAR(20),
        age INT
      )
    `);

    // Create contacts table (for contact.html form)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ MySQL tables ensured (users & contacts).");
  } catch (err) {
    console.error("❌ Database initialization failed:", err);
    process.exit(1);
  }
}

// --- ROUTES ---

// Save user form data (from index.html)
app.post('/submit', async (req, res) => {
  const { username, email, mobile, age } = req.body;
  if (!username || !email || !mobile || !age)
    return res.status(400).send('Missing required fields.');

  try {
    await pool.query(
      'INSERT INTO users (username, email, mobile, age) VALUES (?, ?, ?, ?)',
      [username, email, mobile, age]
    );
    res.send('User data saved successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Database error.');
  }
});

// Save contact form data (from contact.html)
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).send('All fields are required.');

  try {
    await pool.query(
      'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );
    res.send('Your message has been received successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Database error while saving message.');
  }
});

// --- SERVER STARTUP ---

const PORT = 3001;
initDb().then(() => {
  app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
});
