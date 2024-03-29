const express = require('express');
const { pool } = require('../db'); 
const router = express.Router();

// Tüm öğrencileri getir
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM students');
    res.json(rows);
  } catch (error) {
    console.error('Öğrencileri alma hatası:', error);
    res.status(500).json({ error: 'Öğrencileri alma hatası' });
  }
});

// Belirli bir öğrenciyi getir
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Öğrenci bulunamadı' });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    console.error('Öğrenciyi alma hatası:', error);
    res.status(500).json({ error: 'Öğrenciyi alma hatası' });
  }
});

// Yeni bir öğrenci ekle
router.post('/', async (req, res) => {
  const { name, email, deptid, counter } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO students (name, email, deptid, counter) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, deptid, counter]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Öğrenci ekleme hatası:', error);
    res.status(500).json({ error: 'Öğrenci ekleme hatası' });
  }
});

// Belirli bir öğrenciyi güncelle
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, deptid, counter } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE students SET name = $1, email = $2, deptid = $3, counter = $4 WHERE id = $5 RETURNING *',
      [name, email, deptid, counter, id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Güncellenecek öğrenci bulunamadı' });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    console.error('Öğrenci güncelleme hatası:', error);
    res.status(500).json({ error: 'Öğrenci güncelleme hatası' });
  }
});

// Belirli bir öğrenciyi sil
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM students WHERE id = $1', [id]);
    res.json({ message: 'Öğrenci başarıyla silindi' });
  } catch (error) {
    console.error('Öğrenci silme hatası:', error);
    res.status(500).json({ error: 'Öğrenci silme hatası' });
  }
});

module.exports = router;