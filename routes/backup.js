const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

router.post('/mail', async (req, res) => {
  try {
    await sendEmail();
    res.json({ message: 'E-posta başarıyla gönderildi' });
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    res.status(500).json({ error: 'E-posta gönderme hatası' });
  }
});

function calculateBackupTimes(period) {
  const backupTime = '15 09 * * 3'; // Dakika, saat, gün, ay, haftanın günü (0: Pazar, 1: Pazartesi, ..., 6: Cumartesi)
  return backupTime;
}

const backupTime = calculateBackupTimes(process.env.PERIOD);

async function sendEmail() {
  try {
    const { rows: students } = await pool.query('SELECT * FROM students');
    const jsonData = JSON.stringify(students, null, 2);
    const filePath = './students.json';
    fs.writeFileSync(filePath, jsonData, 'utf-8');
    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: process.env.MAIL_TO,
      subject: `Haftalık Rapor`,
      text: `\n Haftalık yedekleme raporu ektedir: \n  ${jsonData}`,
      attachments: [
        {
          filename: 'students.json',
          path: filePath
        }
      ]
    };
    await transporter.sendMail(mailOptions);
    console.log('E-posta gönderildi');
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    throw error;
  }
}

cron.schedule(backupTime, async () => {
  try {
    await sendEmail();
  } catch (error) {
    console.error('Haftalık rapor oluşturma hatası:', error);
  }
}, {
  timezone: "Europe/Istanbul"
});

module.exports = router;
