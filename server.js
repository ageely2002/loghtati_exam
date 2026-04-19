const express = require('express');
const cors    = require('cors');
const { v4: uuidv4 } = require('uuid');
const low     = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path    = require('path');

const adapter = new FileSync('db.json');
const db      = low(adapter);

// Initialize DB defaults
db.defaults({ submissions: [] }).write();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── POST /api/submit  (student submits exam) ──────────────────
app.post('/api/submit', (req, res) => {
  const { name, seat, className, answers, score, total } = req.body;
  if (!name || !answers || score === undefined) {
    return res.status(400).json({ error: 'بيانات غير مكتملة' });
  }
  const record = {
    id:        uuidv4(),
    name:      name.trim(),
    seat:      seat || '—',
    className: className || '—',
    answers,
    score,
    total:     total || 20,
    pct:       Math.round(score / (total || 20) * 100),
    submittedAt: new Date().toISOString()
  };
  db.get('submissions').push(record).write();
  res.json({ success: true, id: record.id, score: record.score });
});

// ── GET /api/results  (teacher dashboard) ────────────────────
app.get('/api/results', (req, res) => {
  const secret = req.headers['x-teacher-key'];
  if (secret !== process.env.TEACHER_KEY && secret !== 'teacher123') {
    return res.status(401).json({ error: 'غير مصرح' });
  }
  const subs = db.get('submissions').orderBy('submittedAt','desc').value();
  const stats = {
    total:   subs.length,
    avgScore: subs.length ? +(subs.reduce((a,s)=>a+s.score,0)/subs.length).toFixed(2) : 0,
    highest: subs.length ? Math.max(...subs.map(s=>s.score)) : 0,
    lowest:  subs.length ? Math.min(...subs.map(s=>s.score)) : 0,
    passed:  subs.filter(s=>s.pct>=60).length,
  };
  res.json({ stats, submissions: subs });
});

// ── DELETE /api/results/:id ────────────────────────────────
app.delete('/api/results/:id', (req, res) => {
  const secret = req.headers['x-teacher-key'];
  if (secret !== process.env.TEACHER_KEY && secret !== 'teacher123') {
    return res.status(401).json({ error: 'غير مصرح' });
  }
  db.get('submissions').remove({ id: req.params.id }).write();
  res.json({ success: true });
});

// ── GET /api/results/export  (CSV) ────────────────────────
app.get('/api/results/export', (req, res) => {
  const secret = req.headers['x-teacher-key'];
  if (secret !== process.env.TEACHER_KEY && secret !== 'teacher123') {
    return res.status(401).json({ error: 'غير مصرح' });
  }
  const subs = db.get('submissions').orderBy('submittedAt','desc').value();
  const csv = [
    'الاسم,رقم الجلوس,الفصل,الدرجة,النسبة,تاريخ التسليم',
    ...subs.map(s => `"${s.name}","${s.seat}","${s.className}",${s.score},${s.pct}%,"${new Date(s.submittedAt).toLocaleString('ar-SA')}"`)
  ].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=results.csv');
  res.send('\uFEFF' + csv); // BOM for Excel Arabic
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
