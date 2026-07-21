// Gelen isteği kendi PUBLIC_EMAIL_API_TOKEN'ımızla doğrular.
// X-Api-Key veya Authorization: Bearer <token> kabul edilir.
function requirePublicApiToken(req, res, next) {
  const expected = process.env.PUBLIC_EMAIL_API_TOKEN;
  if (!expected) {
    console.error('PUBLIC_EMAIL_API_TOKEN .env dosyasında tanımlı değil');
    return res.status(500).json({ success: false, message: 'Server configuration error.' });
  }

  const headerKey = req.headers['x-api-key'];
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  const provided = headerKey || bearerToken;

  if (!provided || provided !== expected) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }

  next();
}

module.exports = { requirePublicApiToken };
