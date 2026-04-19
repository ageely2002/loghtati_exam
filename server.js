const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// الربط مع قاعدة البيانات السحابية
// سيقوم السيرفر بجلب الرابط من إعدادات Render بشكل آمن
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('تم الاتصال بنجاح بـ MongoDB Atlas'))
  .catch(err => console.error('خطأ في الاتصال:', err));

// تعريف سجل بيانات الطالب
const resultSchema = new mongoose.Schema({
  studentName: String,
  score: Number,
  total: Number,
  date: { type: Date, default: Date.now }
});
const Result = mongoose.model('Result', resultSchema);

app.use(express.json());
app.use(express.static('public'));

// استقبال الإجابات وحفظها في السحابة
app.post('/api/submit', async (req, res) => {
  try {
    const newResult = new Result(req.body);
    await newResult.save();
    res.json({ success: true });
  } catch (error) {
    console.error('فشل حفظ النتيجة:', error);
    res.status(500).json({ success: false });
  }
});

// جلب النتائج للوحة التحكم
app.get('/api/results', async (req, res) => {
  try {
    const results = await Result.find().sort({ date: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json([]);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`السيرفر يعمل الآن على منفذ ${PORT}`));