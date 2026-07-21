# Public Email API — Maileroo Wrapper

Basit bir transactional e-posta API'si. Gelen istekleri kendi `PUBLIC_EMAIL_API_TOKEN`'ımızla
doğrular, arkada gerçek gönderimi [Maileroo](https://maileroo.com) üzerinden yapar.

Kendi mail sunucusu (Postfix/DKIM/PTR) kurmaya gerek yok — deliverability/IP reputasyonu
işini Maileroo hallediyor. Tek gereken, Maileroo panelinde gönderen domain'i doğrulamak.

## İki ayrı kimlik bilgisi — karıştırma

| | Ne | Kim üretir | Nerede kullanılır |
|---|---|---|---|
| `MAILEROO_API_KEY` | Maileroo'nun bize verdiği gerçek key | Maileroo | Bizim backend'imizden Maileroo'ya giden isteklerde |
| `PUBLIC_EMAIL_API_TOKEN` | Kendi ürettiğimiz erişim token'ı | Biz | Bize istek atan istemcilerden gelen `X-Api-Key` / `Authorization: Bearer` header'ında |

## Kurulum

```bash
npm install
cp .env.example .env
npm run gen-token          # PUBLIC_EMAIL_API_TOKEN üretir, .env'e yapıştır
nano .env                  # MAILEROO_API_KEY'i de gir
pm2 start server.js --name public-email-api
```

## Maileroo tarafında yapılacaklar (bir kere)

1. Maileroo panelinde bir domain ekle (örn. `mailapi.senin-domainin.com`)
2. Panelin verdiği DNS kayıtlarını (genelde SPF + DKIM + bazen bir doğrulama TXT'i) domain
   sağlayıcında (Cloudflare, İsimtescil vb.) ekle
3. Domain "verified" olunca `from` alanında bu domain altındaki adresleri kullanabilirsin
   (örn. `noreply@mailapi.senin-domainin.com`)

## Test

```bash
curl -X POST http://localhost:4200/api/public/send-email \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: <.env'deki PUBLIC_EMAIL_API_TOKEN>" \
  -d '{
    "from": "noreply@dogrulanan-domain.com",
    "fromName": "Test",
    "to": "kendi-mailin@gmail.com",
    "subject": "Test",
    "plain": "Bu bir test mesajıdır."
  }'
```

Beklenen cevap:
```json
{ "success": true, "message": "The email has been scheduled for delivery.", "referenceId": "..." }
```

## Nginx reverse proxy (opsiyonel, domain ile erişim için)

```nginx
server {
    server_name mailapi.senin-domainin.com;
    location / {
        proxy_pass http://localhost:4200;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
Sonra `certbot --nginx -d mailapi.senin-domainin.com` ile SSL.

## GitHub'a yedekleme

```bash
git init
git add .
git commit -m "Public Email API ilk sürüm"
git remote add origin git@github.com:Hyb2779/<repo-adi>.git
git push -u origin main
```

**Not:** `.env` dosyası (içinde gerçek Maileroo key'i olacak) `.gitignore` ile hariç tutuldu,
asla commit etme.
