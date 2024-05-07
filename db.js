
require('dotenv').config();

const { Pool } = require('pg');

// PostgreSQL bağlantı ayarlarını .env dosyasından al
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  PERIOD: process.env.PERIOD, // E-posta gönderme periyodu
});

// Veritabanı tablolarını oluşturmak için
async function createTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Öğrenci tablosu oluştur
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100),
        dept_id INT,
        counter INT
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Öğrenci sayaç tablosu oluştur
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_counter (
        id SERIAL PRIMARY KEY,
        counter INT DEFAULT 0
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Eğer student_counter tablosunda hiç veri yoksa, başlangıç sayaç değerini 0 olarak belirle
    const result = await client.query('SELECT * FROM student_counter');
    if (result.rowCount === 0) {
      await client.query('INSERT INTO student_counter (counter) VALUES (0)');
    }

    // Bölüm tablosu oluştur
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        std_id INT
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  createTables,
};
