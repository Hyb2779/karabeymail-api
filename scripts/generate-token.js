#!/usr/bin/env node
// Kullanım: node scripts/generate-token.js
// Rastgele, güvenli bir PUBLIC_EMAIL_API_TOKEN üretir (Maileroo key'i ile karıştırılmasın diye ayrı).
const crypto = require('crypto');
const token = crypto.randomBytes(32).toString('hex');
console.log('PUBLIC_EMAIL_API_TOKEN=' + token);
