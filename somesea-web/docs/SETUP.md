# Menjalankan Somesea HQ

Somesea HQ 0.2.0 adalah aplikasi Next.js App Router, TypeScript, Tailwind CSS 4, Supabase Auth dan PostgreSQL. Deploy target Vercel; source aplikasi berada di `somesea-web`, bukan folder `dist` warisan.

## 1. Prasyarat

- Node.js 22 atau 24 LTS dan npm 11.
- Proyek Supabase yang dikelola Sams; region dekat Indonesia bila membuat proyek baru.
- Akun Vercel dengan akses ke proyek tujuan.

Tidak ada akun atau transaksi contoh yang dimasukkan ke database. Jangan menggunakan service-role key untuk menjalankan aplikasi.

## 2. Database

Jalankan `supabase/migrations/202610200001_workspace.sql` pada Supabase SQL Editor di proyek tujuan. Ini membuat tabel baru `public.workspaces`, fungsi validasi, RPC atomik, dan RLS. Migrasi tidak menghapus tabel atau data yang ada. Jika nama tersebut sudah dipakai aplikasi lain, tinjau terlebih dahulu; jangan menimpa tabel.

Alternatif dengan CLI yang sudah terautentikasi:

```sh
npx supabase login
npx supabase link --project-ref PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
```

Paket ini menyertakan konfigurasi CLI pada `supabase/config.toml`. Password database dan access token hanya dimasukkan melalui prompt aman CLI/pengelola rahasia, bukan di chat atau source control.

## 3. Auth dan konfigurasi aman

1. Di Supabase Auth, nonaktifkan signup publik untuk ruang kerja personal ini.
2. Buat atau undang akun Sams dari pengelolaan pengguna Supabase. Atur kata sandi melalui alur pengaturan akun yang aman. UI aplikasi menyediakan login password dan logout; tidak menyediakan registrasi publik atau reset password mandiri.
3. Atur Site URL ke URL Vercel setelah deploy. Tambahkan hanya redirect URL yang diperlukan untuk undangan/pemulihan akses. Untuk pemulihan password, gunakan pengelolaan akun Supabase sampai alur reset mandiri dikembangkan.
4. Salin `.env.example` menjadi `.env.local`. Isi URL proyek dan **publishable key** dari menu Connect/API proyek:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Publishable key memang boleh diketahui browser; akses data tetap dibatasi JWT dan RLS. Jangan isi service-role key, secret API key, password database, atau token Vercel pada variabel `NEXT_PUBLIC_*`.

## 4. Jalankan dan verifikasi

```sh
npm ci
npm run verify:documents
npm run typecheck
npm test
npm run build
npm run dev
```

Tanpa environment, aplikasi mengarah ke halaman masuk dengan status menunggu konfigurasi. Halaman kerja dan pustaka bisnis tidak dibuka. Tidak ada mode demo yang menyamar sebagai data akun.

Untuk uji browser lokal, `npm run build` terlebih dahulu, kemudian `npx playwright install chromium` dan `npm run test:e2e`. Jika Chrome sudah tersedia, set `CHROME_PATH` ke executable-nya. Tes menjalankan fixture UI di port 4173 dan server produksi Next.js di 4174; fixture tidak termasuk rute produksi. Bila Supabase environment aktif, jalankan suite tanpa environment tersebut untuk skenario konfigurasi kosong.

## 5. Deploy Vercel

Root Directory harus `somesea-web` bila repository mencakup seluruh HQ. Framework Preset Next.js. `vercel.json` memakai `npm ci`, `npm run build`, dan region Singapore `sin1`. Jangan memilih static output `dist` atau `next export`.

Tambahkan dua environment Supabase di Vercel Settings → Environment Variables untuk Production, dan Preview jika diinginkan. Lakukan redeploy setelah mengganti environment. Gunakan login browser CLI atau integrasi terhubung, tanpa menaruh token di chat:

```sh
npx vercel login
npx vercel link
npx vercel deploy --prod
```

Sebelum menyatakan URL terverifikasi: buka URL HTTPS, periksa pengalihan `/` ke `/login` tanpa sesi, masuk sebagai akun Sams, buat/edit/hapus satu catatan pengujian yang jelas diberi label dan disetujui, refresh, buka dari perangkat kedua, cek ekspor/impor, lalu logout. Uji isolasi menggunakan dua akun khusus pengujian di proyek staging, bukan akun bisnis.

Jangan deploy dengan menganggap hasil fixture UI sebagai bukti bahwa Auth/database cloud sudah lulus. Deployment dan tes layanan langsung harus dicatat di laporan rilis.

## 6. Perilaku penyimpanan

- Satu baris JSONB per pemilik di PostgreSQL. Semua mutasi melalui server action berautentikasi dan RPC `save_workspace` dengan revision compare-and-swap.
- RLS membatasi SELECT, INSERT, UPDATE sesuai `auth.uid()`. Penghapusan baris workspace tidak dibuka untuk pengguna aplikasi.
- Setiap snapshot diperiksa Zod di server dan CHECK constraint di database. Input tidak boleh menyertakan identitas pemilik.
- Snapshot disimpan atomik. Konflik lintas perangkat meminta muat ulang; tidak menimpa secara diam-diam. Tombol Muat ulang mengambil data terbaru; belum ada realtime push.
- Batas agregat 2 MB di database, dengan batas konservatif 1,9 MB di server. Cocok untuk workspace personal kecil. Untuk data lebih besar, rencanakan migrasi ke tabel per entitas.
- Sesi cookie diperbarui Proxy; identitas diperiksa ulang melalui Auth di server. Halaman pribadi menggunakan no-store. Tidak ada penyimpanan bisnis ke localStorage atau fallback cloud palsu.
- Dokumen sumber baca-saja tetap utuh. Koreksi keputusan baru dicatat terpisah; tidak menyunting bukti sumber secara diam-diam.

## 7. Cadangan

Gunakan Data & cadangan → Ekspor data JSON. Simpan file di lokasi cadangan pilihan Sams. Ekspor mencakup data operasional akun, bukan sesi, email, atau rahasia. Dokumen sumber tersedia di folder `../Somesea-HQ` dan bisa diunduh dari Pustaka HQ. Backup otomatis terjadwal belum diaktifkan; pengaturan backup Supabase mengikuti paket proyek yang dipilih.
