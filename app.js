const express = require('express');
const { createTables } = require('./db');
const studentsRouter = require('./routes/students');
const departmentsRouter = require('./routes/departments');
const backupRouter = require('./routes/backup');
const authRouter = require('./routes/auth');
const verifyToken = require('./middleware/verifyToken');
const app = express();
const db = require('./db');

const swaggerUi = require('swagger-ui-express');
swaggerDocument = require('./swagger.json');
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/auth', authRouter);
app.use('/students', verifyToken, studentsRouter);
app.use('/departments', verifyToken, departmentsRouter);
app.use('/backup', verifyToken, backupRouter);

app.get('/', (req, res) => {
  res.send('Anasayfa!');
});

async function main() {
  try {
    await createTables();
    await db.addTimestampColumns();
    console.log('Veritabanı tabloları başarıyla oluşturuldu.');
  } catch (error) {
    console.error('Veritabanı tabloları oluşturulurken bir hata oluştu:', error);
  }
  
}

main();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
