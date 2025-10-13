const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
  host: 'mysql',
  user: 'root',
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: 'healingdb',
};

let pool;

async function initDb() {
  pool = await mysql.createPool(dbConfig);
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255),
    mobile VARCHAR(20),
    age INT
  )`);
}

app.post('/submit', async (req, res) => {
  const { username, email, mobile, age } = req.body;
  if (!username || !email || !mobile || !age) return res.status(400).send('Missing required fields.');
  try {
    await pool.query('INSERT INTO users (username, email, mobile, age) VALUES (?, ?, ?, ?)', [username, email, mobile, age]);
    res.send('User data saved successfully.');
  } catch (error) {
    res.status(500).send('Database error.');
  }
});

const PORT = 3001;
initDb().then(() => {
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
});
