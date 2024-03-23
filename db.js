
require('dotenv').config();

const { Pool } = require('pg');

// PostgreSQL bağlantı ayarlarını .env dosyasından al
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
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
      )
    `);

    // Bölüm tablosu oluştur
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        std_id INT
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
