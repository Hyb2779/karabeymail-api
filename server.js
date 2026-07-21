// Public Email API — Maileroo wrapper
require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json({ limit: '2mb' }));

app.use('/api/public', require('./routes/sendEmail'));

app.get('/health', (req, res) => res.json({ ok: true, service: 'public-email-api', time: new Date().toISOString() }));

const PORT = process.env.PORT || 4200;
app.listen(PORT, () => console.log(`Public Email API çalışıyor: http://localhost:${PORT}`));
