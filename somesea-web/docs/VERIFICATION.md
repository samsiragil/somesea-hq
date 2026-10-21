# Laporan verifikasi Somesea HQ 0.2.0

Tanggal: **20 Oktober 2026**, Asia/Makassar. Lokasi kerja: `C:\Work\Personal\Somesea-HQ\somesea-web`.

**Status: implementasi lokal dan build lulus. Supabase cloud dan deployment Vercel belum dijalankan karena akses belum terhubung. Belum ada URL produksi terverifikasi.**

## Hasil akhir

| Pemeriksaan | Hasil | Batas bukti |
|---|---|---|
| Salinan awal | 42 berkas cocok SHA-256 | Sumber tidak dihapus; README lama dipertahankan di docs |
| Pustaka | 18/18 dokumen cocok SHA-256 | Dibandingkan dengan dokumen bisnis sumber, isi tetap utuh |
| TypeScript | Lulus | Pemeriksaan strict dan build Next.js |
| Build produksi | Lulus, Next.js 16.4.2 | Build lokal, tidak menyatakan deployment cloud |
| Vitest | **33 lulus, 1 dilewati** | Logika, server actions dengan repository mock, PostgreSQL PGlite |
| Playwright | **14 lulus** | Tujuh skenario × desktop dan mobile Chromium |
| Audit dependensi produksi | 0 kerentanan dilaporkan | `npm audit --omit=dev`, sesuai basis advisory saat pemeriksaan |
| Auth Supabase langsung | Dilewati | Belum ada koneksi proyek dan dua akun staging aman |
| Migrasi Supabase tujuan | Belum diterapkan | SQL diuji lokal; database cloud belum diakses |
| Persistensi lintas perangkat cloud | Belum diuji | Persistensi disk PostgreSQL lokal dan konflik revisi sudah diuji |
| Deploy Vercel | Belum dijalankan | Konfigurasi tersedia; belum ada akun/proyek terhubung |

Total tes yang lulus: **47**. Tes gagal selama pengembangan telah diperbaiki dan suite terakhir lulus. Satu tes live sengaja dilewati, bukan dianggap lulus.

## Bukti yang dicakup

**Logika dan server:** pemisahan omzet/DP/biaya/bulan; Won tidak otomatis mencatat omzet; nilai negatif/pecahan/berlebihan ditolak; tanggal kalender dan tahun kabisat; empat status keputusan; CRUD tidak mengubah snapshot asal; migrasi v1 mempertahankan ID/tugas/roadmap/tanggal; round-trip v2; konflik ID; gabung checklist; penggantian dengan snapshot kosong; JSON rusak/kolom tambahan/ID berulang/file besar ditolak; sesi ditolak tidak menulis; revisi basi tidak menulis; pratinjau tidak menulis; perubahan file/mode/revisi setelah pratinjau ditolak; konfirmasi wajib; kegagalan simpan tidak ditampilkan sebagai sukses.

**PostgreSQL:** SQL migrasi dieksekusi pada PGlite, mesin PostgreSQL WASM, dengan role anon/authenticated dan fungsi auth.uid simulasi. Anon ditolak; dua UUID pemilik terisolasi untuk read/insert/update; CAS menolak revisi lama; payload gagal tidak menghasilkan perubahan parsial; CHECK juga melindungi pembaruan langsung; pemilik tidak bisa diganti; trigger memaksa revision monotonik; penggantian satu pemilik tidak menyentuh pemilik lain. Database disk ditutup dan dibuka kembali untuk memeriksa persistensi. Ini menguji PostgreSQL dan RLS, belum menguji JWT/gateway/operasi Supabase terkelola.

**Browser:** dashboard kosong, semua navigasi, 18 dokumen, lebar viewport; CRM tambah/edit/hapus/search/filter dan tanggal tindak lanjut; ledger dengan omzet Rp5 juta, kas Rp2 juta dan biaya Rp300 ribu menghasilkan arus kas Rp1,7 juta; impor v1 dengan pratinjau/konfirmasi dan ekspor v2; root Next.js produksi tanpa sesi mengalihkan ke login; file pustaka privat tidak tersedia melalui URL source; roadmap tanggal/checklist; keputusan dan inventaris CRUD; JSON rusak; mode ganti memerlukan konfirmasi cadangan.

Pengujian antarmuka kerja menggunakan fixture terisolasi di port 4173 dengan penyimpanan hanya dalam memori proses browser. **Fixture bukan aplikasi produksi dan tidak dipakai sebagai bukti penyimpanan cloud.** Uji pengalihan/proteksi halaman memakai build Next.js sebenarnya di port 4174 tanpa Supabase dikonfigurasi. Pengujian mobile memakai viewport iPhone 13 pada Chromium, belum perangkat iOS fisik/Safari.

Screenshot desktop dan mobile ditinjau. Layout mobile yang sempat melebar telah diperbaiki, dan tes mengunci innerWidth ke viewport agar tidak lolos karena viewport mobile otomatis membesar.

## Sebelum deployment dianggap selesai

1. Hubungkan Supabase dan Vercel melalui integrasi akun aman atau login CLI browser.
2. Pilih proyek Supabase tujuan, tinjau objek existing, terapkan migrasi, nonaktifkan signup publik, siapkan akun Sams.
3. Isi URL proyek dan publishable key melalui `.env.local`/Vercel environment. Tidak memerlukan service-role key di aplikasi.
4. Gunakan dua akun staging untuk tes live Auth, logout, refresh dan isolasi. Kredensial hanya melalui environment aman. Jalankan tes Auth opt-in yang sudah disediakan.
5. Periksa CRUD, ledger, impor–ekspor, refresh dan akses dari perangkat kedua pada backend sebenarnya.
6. Deploy Vercel, buka URL HTTPS, cek proteksi halaman serta sesi, dan ulangi smoke test sebelum mencatat URL sebagai terverifikasi.

## Keterbatasan produk

- Sinkronisasi dilakukan saat buka halaman atau tekan Muat ulang; belum ada realtime push.
- Batas snapshot personal 2 MB database, 1,9 MB server; koleksi juga dibatasi untuk menjaga validasi dan ukuran impor.
- Login/logout tersedia. Signup publik dan pemulihan password mandiri tidak disediakan; pemulihan akun melalui pengelola Supabase.
- Ekspor manual tersedia, backup terjadwal belum dikonfigurasi.
- Business OS lama, lampiran image(1).png, tools dan langganan historis belum dipulihkan atau diverifikasi.
- Tidak ada data operasional contoh yang dimasukkan sebagai data aktual.

## Acuan implementasi

- [Supabase SSR dan refresh sesi](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase PostgreSQL RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Next.js Proxy](https://nextjs.org/docs/app/getting-started/proxy)
- [Next.js di Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)

## Penyesuaian awal — 21 Oktober 2026

Halaman awal kini memandu empat langkah: ritme, arah latihan, audit bekal, dan latihan kecil. Setiap langkah memiliki alasan, tindakan, contoh yang bisa dibuka, kriteria selesai, serta catatan maksimal 500 karakter. Catatan disimpan sebagai keputusan dengan ID `prep-*`; EKSPERIMEN berarti proses, FINAL berarti pengguna menandai langkah selesai. Ini tidak mengesahkan kelayakan bisnis secara otomatis. Checklist lama tetap di Roadmap, tanpa mengubah ID atau isi data lama.

Toggle Light/Dark berada di header setiap halaman workspace. Pilihan mengikuti sistem saat belum ada preferensi, lalu disimpan di localStorage browser; bukan data akun. Penyimpanan catatan tetap memakai server/Supabase yang sudah ada.

Validasi: TypeScript lulus, 33 tes logika/database lulus (1 live-auth dilewati), 18 dokumen sumber cocok SHA-256. Build produksi berhasil memakai `next build --webpack`; Turbopack pada mesin Windows ini gagal membuat subprocess CSS. Pengujian browser memakai fixture terisolasi, bukan bukti sinkronisasi akun cloud. Belum dideploy.

Browser: 16 skenario desktop/mobile lulus (15 pada run utama, 1 diulang setelah reload HMR mengganggu tes). Tampilan desktop light dan mobile dark ditinjau. Login produksi dan Supabase live tidak diuji ulang pada revisi ini.
