const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// Tüm departmanları getir
router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM departments');
      res.json(rows);
    } catch (error) {
      console.error('Departmanları getirme hatası:', error);
      res.status(500).json({ error: 'Departmanları getirme hatası' });
    }
  });

// Yeni bir departman ekle
router.post('/', async (req, res) => {
  const { name, dept_std_id } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO departments (name, dept_std_id) VALUES ($1, $2) RETURNING *',
      [name, dept_std_id]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Departman ekleme hatası:', error);
    res.status(500).json({ error: 'Departman ekleme hatası' });
  }
});

// Belirli bir departmanı güncelle
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, dept_std_id } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE departments SET name = $1, dept_std_id = $2 WHERE id = $3 RETURNING *',
      [name, dept_std_id, id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Güncellenecek departman bulunamadı' });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    console.error('Departman güncelleme hatası:', error);
    res.status(500).json({ error: 'Departman güncelleme hatası' });
  }
});

// Belirli bir departmanı sil
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM departments WHERE id = $1', [id]);
    res.json({ message: 'Departman başarıyla silindi' });
  } catch (error) {
    console.error('Departman silme hatası:', error);
    res.status(500).json({ error: 'Departman silme hatası' });
  }
});


module.exports = router;
