const express = require('express');
const { requirePublicApiToken } = require('../middleware/auth');

const router = express.Router();

const MAILEROO_URL = 'https://smtp.maileroo.com/api/v2/emails';

function isValidEmail(str) {
  return typeof str === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

router.post('/send-email', requirePublicApiToken, async (req, res) => {
  const { from, fromName, to, subject, plain, html } = req.body || {};

  // --- Doğrulama ---
  const errors = [];
  if (!isValidEmail(from)) errors.push('from geçerli bir e-posta adresi olmalı');
  if (!isValidEmail(to)) errors.push('to geçerli bir e-posta adresi olmalı');
  if (!subject || typeof subject !== 'string' || subject.length > 255) {
    errors.push('subject zorunlu ve en fazla 255 karakter olmalı');
  }
  if (!plain && !html) errors.push('plain veya html alanlarından en az biri zorunlu');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }

  // --- Maileroo'ya ilet ---
  const mailerooKey = process.env.MAILEROO_API_KEY;
  if (!mailerooKey) {
    console.error('MAILEROO_API_KEY .env dosyasında tanımlı değil');
    return res.status(500).json({ success: false, message: 'Server configuration error.' });
  }

  const payload = {
    from: { address: from, display_name: fromName || undefined },
    to: [{ address: to }],
    subject,
  };
  if (html) payload.html = html;
  if (plain) payload.plain = plain;

  try {
    const mailerooRes = await fetch(MAILEROO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mailerooKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await mailerooRes.json().catch(() => ({}));

    if (!mailerooRes.ok) {
      console.error('Maileroo hata döndü:', mailerooRes.status, data);
      return res.status(mailerooRes.status >= 500 ? 500 : 400).json({
        success: false,
        message: data.message || 'Maileroo isteği başarısız oldu.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'The email has been scheduled for delivery.',
      referenceId: data.reference_id || data.referenceId || data.data?.reference_id || null,
    });
  } catch (err) {
    console.error('Maileroo isteği sırasında hata:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
