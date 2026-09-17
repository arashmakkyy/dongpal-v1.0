# دنگ‌پال (DongPal)

اپ فارسی (RTL) برای تقسیم دنگ دورهمی — بدون ثبت‌نام، با لینک دعوت.

## اجرا

```bash
npm install
npm run dev      # http://localhost:8080
npm run typecheck
npm test
npm run build
```

## متغیرهای محیطی

سرور (فقط سمت سرور، هرگز `VITE_` نکن):
- `DATABASE_URL` — Postgres/Neon. اگه نباشه به‌ترتیب `POSTGRES_URL` و
  `POSTGRES_URL_NON_POOLING` هم قبول میشه (برای migrate ترجیح با NON_POOLINGـه).
  اگه هیچ‌کدوم نباشه اپ با PGLite موقت بالا میاد (دیتا می‌پره).
- `XAI_API_KEY` — اختیاری، برای اسکن رسید. فعلاً صفحه اسکن coming-soon و غیرفعاله.

کلاینت (موقع بیلد داخل JS میره — عمومی حساب کن):
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` — فعلاً استفاده مستقیم از مرورگر حذف شده؛ سینک از طریق Server Function انجام میشه. این کلیدها برای قدم بعدی (Realtime امن) نگه داشته بشن.
- `VITE_AUTH_ENABLED=false` نگه دار (اپ لاگین نداره).

> نکته امنیتی: دسترسی مستقیم مرورگر به جدول `gathering_rooms` بسته شده
> (`migrations/0004_room_secrets.sql`). همه خواندن/نوشتن از
> `src/lib/room-api.ts` سمت سرور رد میشه و نوشتن نیاز به `write_secret` داره
> که موقع ساخت گروه صادر و در `localStorage` نگه داشته میشه.

## دیتابیس

- اسکیما فقط در `migrations/*.sql`. روی Vercel موقع `npm run build` با `scripts/migrate.mjs` اعمال میشه.
- اگه از Supabase هم برای Realtime استفاده می‌کنی، فایل `0004` رو یک بار در SQL Editor سوپابیس هم اجرا کن تا پالیسی‌های باز `0003` بسته بشن.

## دیپلوی Vercel

`vercel.json` شامل `buildCommand` + هدرهای امنیتیه. در داشبورد Vercel ست کن:
`DATABASE_URL` (Production + Preview)، بعد redeploy.
