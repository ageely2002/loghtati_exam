# 🎓 نظام اختبار لغتي — سموم قاتلة

## هيكل الملفات
```
exam-server/
├── server.js          ← السيرفر الرئيسي (Node.js + Express)
├── db.json            ← قاعدة البيانات (تُنشأ تلقائياً)
├── package.json
└── public/
    ├── index.html     ← صفحة الاختبار للطلاب
    └── teacher.html   ← لوحة تحكم المعلم
```

## الروابط بعد التشغيل
| الرابط | الاستخدام |
|--------|-----------|
| `http://localhost:3000` | الاختبار للطلاب |
| `http://localhost:3000/teacher.html` | لوحة المعلم |

## كلمة المرور الافتراضية للمعلم
```
teacher123
```
غيّرها بتعديل السطر في server.js:
```js
if (secret !== process.env.TEACHER_KEY && secret !== 'teacher123')
```

---

## ▶ تشغيل محلي (للتجربة)

```bash
cd exam-server
npm install
node server.js
```

ثم افتح المتصفح على: http://localhost:3000

---

## 🚀 الرفع على Render.com (مجاني ودائم)

1. ارفع المجلد على GitHub (مستودع جديد)
2. اذهب إلى https://render.com → New → Web Service
3. اربطه بالمستودع
4. الإعدادات:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. أضف متغير بيئة:
   - `TEACHER_KEY` = كلمة مرور المعلم الخاصة بك
6. انشر — ستحصل على رابط مثل: `https://exam-xyz.onrender.com`

---

## 🚀 الرفع على Railway.app (بديل سهل)

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

---

## 🔒 API Endpoints

| Method | URL | الوصف |
|--------|-----|-------|
| POST | `/api/submit` | إرسال إجابات الطالب |
| GET | `/api/results` | جلب كل النتائج (يحتاج مفتاح) |
| DELETE | `/api/results/:id` | حذف إجابة طالب |
| GET | `/api/results/export` | تصدير CSV |

**Header للمعلم:** `x-teacher-key: teacher123`
