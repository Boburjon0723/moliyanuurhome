# Moliya Telegram bot (NuurHome CRM)

Telegram orqali moliya va xodimlar (avans / oylik) yozuvlari — Supabase bilan integratsiya.

Repozitoriya: [github.com/Boburjon0723/moliyanuurhome](https://github.com/Boburjon0723/moliyanuurhome)

## Ishga tushirish (lokal)

```bash
cp .env.example .env
# .env ni to'ldiring
npm install
npm start
```

## Railway da deploy

1. [Railway](https://railway.app) ga kiring → **New Project** → **Deploy from GitHub repo** → `Boburjon0723/moliyanuurhome` ni tanlang.
2. Loyiha sozlamalarida **Variables** (Environment):
   - `BOT_TOKEN` — [@BotFather](https://t.me/BotFather) dan olingan token
   - `SUPABASE_URL` — Supabase loyiha URL
   - `SUPABASE_SERVICE_ROLE_KEY` — **tavsiya** (server uchun; RLS dan tashqari to‘liq huquq)
   - `SUPABASE_ANON_KEY` — ixtiyoriy (service role bo‘lmasa)
   - `BOT_USERS_TABLE` — ixtiyoriy, default `bot_users`
   - `MANAGER_CHAT_IDS` — **2 ta admin** (o‘zingiz va boshliq) ning shaxsiy Telegram **chat_id** lari, vergul bilan: `123456789,987654321`. Shunday foydalanuvchilar `/start` da **telefon so‘ralmaydi**, darhol Moliya menyusi ochiladi. Xodim dam olish so‘rasa, shu chat(lar)ga xabar ketadi.  
     *chat_id ni olish: @userinfobot ga yozing yoki Telegram Web → profilingiz.*
3. **Settings → Deploy**: **Start Command** bo‘sh qoldiring yoki `npm start` (default).
4. **Root Directory**: repoda faqat bot fayllari bo‘lsa o‘zgartirish shart emas.
5. Deploy tugagach logda `Auth lookup table` qatori chiqishi kerak; bot **polling** rejimida ishlaydi — **port ochilmaydi**, Railway faqat jarayonni ushlab turadi.

> **Eslatma:** `SUPABASE_SERVICE_ROLE_KEY` ni hech qachon GitHubga commit qilmang — faqat Railway Variables da.

### «row-level security policy» / INSERT xatosi

- **Eng yaxshi yechim:** Railway Variables da **`SUPABASE_SERVICE_ROLE_KEY`** to‘g‘ri qo‘yilgan bo‘lsin (Supabase → Settings → API → `service_role`). Bot shu kalit bilan RLS dan o‘tadi.
- Agar vaqtincha **anon** kalit ishlatilsa: Supabase **SQL Editor** da `supabase_employee_leave_requests_rls_insert_update.sql` ni ishga tushiring (INSERT/UPDATE ruxsatlari). **«Ha»** bosilganda `employees` yangilanganda ham xato bo‘lsa — service role ishlating.

## Kim qanday kiradi?

- **Adminlar** (`MANAGER_CHAT_IDS` da bo‘lgan 2 kishi): `/start` — **Moliya**, **Xodimlar**, **Moliya ro‘yxati** (telefon kerak emas). **Boshqa hech kim bu tug‘malarni ko‘rmaydi.**
- **CRM xodimlari** (`employees` + telefon): telefon bilan kirgach **faqat «🛏 Dam olmoqchiman»**.
- **Boshqa** (`bot_users` va h.k., lekin admin ham xodim ham emas): moliya tug‘malari **yo‘q**; faqat tushuntirish matni (klaviatura yashiriladi).
- CRM **Xodimlar** kartasida **Telefon** `998XXXXXXXXX` — bot shu raqamni tan oladi.
- Dam olish: xabar adminlarga **Ha / Yo‘q** inline tugmalar bilan boradi. **Ha** — CRM da xodimning `rest_days` +1; **Yo‘q** — rad, CRM o‘zgarmaydi. Avvalgi bazalar uchun: `supabase_employee_leave_approval_columns.sql`.

## Fayllar

| Fayl | Tavsif |
|------|---------|
| `index.js` | Bot mantiq |
| `create_bot_users_access.sql` | `bot_users` jadvali / RLS namunasi |
| `create_employee_leave_requests.sql` | Dam olish so‘rovlari jadvali |
| `.env.example` | Kerakli o‘zgaruvchilar ro‘yxati |
