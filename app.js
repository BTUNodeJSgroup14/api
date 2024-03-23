const express = require('express');
const { createTables } = require('./db');
const studentsRouter = require('./routes/students');
const departmentsRouter = require('./routes/departments');
const app = express();

const swaggerUi = require('swagger-ui-express');
swaggerDocument = require('./swagger.json');
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/students', studentsRouter);
app.use('/departments', departmentsRouter);

app.get('/', (req, res) => {
  res.send('Anasayfa!');
});


async function main() {
  try {
    await createTables();
    console.log('Veritabanı tabloları başarıyla oluşturuldu.');
  } catch (error) {
    console.error('Veritabanı tabloları oluşturulurken bir hata oluştu:', error);
  }
}

// Veritabanı tablolarını oluştur
main();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`)
})