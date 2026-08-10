# PorTC Learning Hub

Frontend Next.js 16 untuk katalog dan pendaftaran pelatihan PorTC. Browser tidak menyimpan token di local storage dan tidak mengakses database langsung. Route handler Next.js bertindak sebagai BFF: access token dan refresh token dari .NET API disimpan pada cookie `HttpOnly`, access token diperbarui otomatis dari session server-side, lalu request browser diteruskan ke backend dengan bearer token.

## Menjalankan lokal

Jalankan backend terlebih dahulu dan pastikan `http://localhost:5000/health` mengembalikan status sehat. Setelah itu jalankan frontend:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Atur URL backend pada `.env.local`:

```env
API_BASE_URL=http://localhost:5000/api
```

`API_BASE_URL` sengaja tidak memakai prefix `NEXT_PUBLIC_`, sehingga alamat origin internal tetap berada di sisi server.
Nilainya harus berupa base API backend (berakhir dengan `/api`), bukan URL GitHub dan bukan URL resource seperti `/api/trainings`.

Cookie sesi mengikuti protokol request: non-`Secure` untuk HTTP lokal dan `Secure` untuk HTTPS. Karena itu alur login yang sama dapat dipakai oleh `npm run dev`, `npm start`, dan deployment HTTPS tanpa mengubah source.

## Alur aplikasi

- `/register` membuat akun pada backend .NET dan langsung membentuk sesi aman.
- `/login` memverifikasi password BCrypt melalui backend.
- `/trainings` menampilkan data PostgreSQL sebenarnya; tidak ada fallback mock.
- `/trainings/[id]` mengirim pendaftaran berdasarkan profil pengguna yang login.
- `/dashboard` hanya menampilkan booking milik pengguna.
- `/admin/dashboard` memerlukan role admin dan dapat menyetujui, menolak, atau membatalkan pendaftaran.
- Admin dapat membuat, mengedit, menutup, dan menghapus pelatihan yang belum memiliki riwayat pendaftaran.
- Navbar berubah berdasarkan session dan role; seluruh halaman memakai tampilan navy-sky klasik PorTC dengan footer responsif.

## Validasi

```bash
npm run typecheck
npm run lint
npm run build
```
