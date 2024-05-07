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
  const { name, email, deptid } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO students (name, email, deptid, created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
      [name, email, deptid]
    );

    // Eğer öğrenci başarıyla eklendiyse
    if (rows.length > 0) {
      // Sayaç değerini güncelle
      const { rows: updatedCounter } = await pool.query('UPDATE student_counter SET counter = counter + 1 RETURNING counter');
      
      // Eklenen öğrencinin bilgilerini ve güncellenmiş sayaç değerini yanıt olarak döndür
      res.status(201).json({ student: rows[0], counter: updatedCounter[0].counter , message: 'Öğrenci başarıyla eklendi' });
    } else {
      res.status(500).json({ error: 'Öğrenci eklenirken bir hata oluştu' });
    }
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
      'UPDATE students SET name = $1, email = $2, deptid = $3, counter = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
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
    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
    const deletedStudent = result.rows[0];  // Silinen öğrencinin bilgileri
    if (deletedStudent) {
      // Sayaç değerini güncelle
      const { rows: updatedCounter } = await pool.query('UPDATE student_counter SET counter = counter - 1 RETURNING counter');
      res.json({ counter: updatedCounter[0].counter, message: 'Öğrenci başarıyla silindi' });
    } else {
      res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }
  } catch (error) {
    console.error('Öğrenci silme hatası:', error);
    res.status(500).json({ error: 'Öğrenci silme hatası' });
  }
});

module.exports = router;