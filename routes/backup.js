const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();

const PERIOD = process.env.PERIOD;

const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

router.post('/mail', async (req, res) => {
  try {
    const filePath = await saveStudentsToJsonFile();
    if (filePath) {
      await sendEmail(filePath);
    } else {
      res.status(500).json({ error: 'Öğrenci listesi dosyası oluşturulamadı' });
    }
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    res.status(500).json({ error: 'E-posta gönderme hatası' });
  }
});

// router.post('/mail', async (req, res) => {
//   try {
//     const { name, email, message } = req.body;
//     const mailOptions = {
//       from: process.env.MAIL_USERNAME,
//       to: email,
//       subject: `Merhaba ${name},`,
//       text: message
//     };
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error('E-posta gönderme hatası:', error);
//         res.status(500).json({ error: 'E-posta gönderme hatası' });
//       } else {
//         console.log('E-posta gönderildi:', info.response);
//         res.json({ message: 'E-posta başarıyla gönderildi' });
//       }
//     });
//   } catch (error) {

//   }
// });

function calculateBackupTimes(period) {
  const backupTime = '0 9 * * 1'; // Dakika, saat, gün, ay, haftanın günü (0: Pazar, 1: Pazartesi, ..., 6: Cumartesi)
  return backupTime;
}

const backupTime = calculateBackupTimes(PERIOD);

async function saveStudentsToJsonFile() {
  try {
    const { rows: students } = await pool.query('SELECT * FROM students');
    const jsonData = JSON.stringify(students, null, 2); // JSON verisini 2 boşluk ile girintiler
    const filePath = './students.json';
    fs.writeFileSync(filePath, jsonData);
    return filePath;
  } catch (error) {
    console.error('Öğrenci listesini dosyaya yazma hatası:', error);
    return null;
  }
}

async function sendEmail(filePath) {
  try {
      const { name, email } = req.body;
      const mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: email,
        subject: `Merhaba ${name} Haftalık Rapor,`,
        text: 'Haftalık yedekleme raporu ektedir.',
        attachments: [
          {
            filename: 'students.json',
            path: filePath
          }
        ]
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('E-posta gönderme hatası:', error);
          res.status(500).json({ error: 'E-posta gönderme hatası' });
        } else {
          console.log('E-posta gönderildi:', info.response);
          res.json({ message: 'E-posta başarıyla gönderildi' });
        }
      });
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    res.status(500).json({ error: 'E-posta gönderme hatası' });
  }
}

cron.schedule(backupTime, async () => {
  try {
    const filePath = await saveStudentsToJsonFile();
    if (filePath) {
      await sendEmail(filePath);
    }
  } catch (error) {
    console.error('Haftalık rapor oluşturma hatası:', error);
  }
}, {
  timezone: "Europe/Istanbul" 
});

module.exports = router;
