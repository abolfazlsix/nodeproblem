const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer'); // اضافه برای آپلود
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

// تنظیم مسیر ذخیره عکس‌ها
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads')); // پوشه uploads حتما باید وجود داشته باشد
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // ذخیره با پسوند اصلی
  }
});
const upload = multer({ storage: storage });

// استاتیک کردن مسیر uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// روت‌ها
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);

// روت آپلود عکس (مثال برای پروفایل یا پست)
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // مسیر عکس برای استفاده در React
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// ایجاد جداول و شروع سرور
const PORT = process.env.PORT || 4000;
async function start() {
  try {
    await sequelize.sync(); // { force: true } اگر بخواهید reset شود
  app.listen(PORT, '0.0.0.0', () => console.log('Server running on port', PORT));

  } catch (error) {
    console.error('Error starting server:', error);
  }
}
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


start();
