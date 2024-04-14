const express = require('express');
const router = express.Router();
const { pool } = require('../db'); 
const fs = require('fs');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();

// Periyot değişkenini .env dosyasından al
const PERIOD = process.env.PERIOD;

// Haftalık yedekleme zamanlarını hesaplayacak fonksiyon
function calculateBackupTimes(period) {  
  // Haftalık periyot için pazartesi gününü ve 09:00'u seç
  const backupTime = '0 9 * * 1'; // Dakika, saat, gün, ay, haftanın günü (0: Pazar, 1: Pazartesi, ..., 6: Cumartesi)
  return backupTime;
}

// Haftalık yedekleme zamanlarını hesapla
const backupTime = calculateBackupTimes(PERIOD); 

// Öğrenci listesini bir JSON dosyasına yaz
async function saveStudentsToJsonFile() {
  try {
    // Tüm öğrencileri veritabanından al
    const { rows: students } = await pool.query('SELECT * FROM students');

    // Öğrenci listesini JSON dosyasına yaz
    const jsonData = JSON.stringify(students, null, 2); // JSON verisini okunabilir hale getir (2 boşluk ile girintile)
    const filePath = 'students.json';
    fs.writeFileSync(filePath, jsonData);

    return filePath;
  } catch (error) {
    console.error('Öğrenci listesini dosyaya yazma hatası:', error);
    return null;
  }
}

// E-posta göndermek için gerekli ayarları yapın
async function sendEmail() {
  // SMTP sunucusu yapılandırması
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS kullanılıyor
    service: 'gmail',
    auth: {
      user: 'your-email@example.com', // E-posta adresinizi girin  
      pass: 'your-password' // E-posta şifrenizi girin
    }
  });

  // E-posta içeriğini oluşturun
  const mailOptions = {
    from: 'your-email@example.com', // Gönderici e-posta adresi
    to: 'recipient@example.com', // Alıcı e-posta adresi
    subject: 'Haftalık Rapor',
    text: 'Haftalık yedekleme raporu ektedir.',
    attachments: [
      {
        filename: 'students.json',
        path: attachmentPath
      }
    ]
  };

  // E-postayı gönderin
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('E-posta gönderme hatası:', error);
    } else {
      console.log('E-posta gönderildi:', info.response);
    }
  });
  
}

// Haftalık yedekleme işlemini zamanlayıcıya ekle rapor oluştur ve e-posta ile gönder
cron.schedule(backupTime, async () => {
  try {
    // Öğrenci listesini dosyaya yaz
    const filePath = await saveStudentsToJsonFile();
    if (filePath) {
      await sendEmail(filePath); // E-posta gönderme işlemini başlat
    }
  } catch (error) {
    console.error('Haftalık rapor oluşturma hatası:', error);
  }
}, {
  timezone: "Europe/Istanbul" // Zaman dilimini belirtmek için kullanılır
});

// // TEST: Her dakika bir log mesajı yazdır ve e-posta gönder
// cron.schedule('* * * * *', () => {
//   console.log('This message will be logged every minute');
//   sendEmail();
//   saveStudentsToJsonFile(["Student 1", "Student 2"]);
// });

module.exports = router;
