# Audit implementasi awal

20 Oktober 2026 · Asia/Makassar.

## Sumber dan salinan

- Tujuan saat pemeriksaan awal belum tersedia. Dibuat setelah izin tulis folder induk diberikan.
- Disalin tanpa menimpa pekerjaan existing: `somesea-web`, `Somesea-HQ-Interaktif.html`, dan `Somesea-HQ`.
- Verifikasi awal: **42 berkas cocok SHA-256**, mencakup 18 dokumen bisnis dan berkas aplikasi/referensi. Sumber asli tetap utuh.
- README aplikasi awal disimpan sebagai `docs/LEGACY-README.md` sebelum README baru ditulis.

## Temuan awal

| Bagian | Kondisi awal | Implementasi baru |
|---|---|---|
| Stack | Vanilla JS/CSS/HTML pada dist | Next.js App Router, TypeScript, Tailwind CSS 4 |
| Persistensi | localStorage somesea-hq-v1, terbatas browser | Snapshot PostgreSQL per pemilik, RLS, revision CAS |
| Auth | Tidak ada | Supabase Auth password, pemeriksaan server, refresh cookie Proxy, logout |
| Proteksi data | Validasi browser saja | Zod server, CHECK PostgreSQL, RPC atomik, pemilik ditentukan JWT |
| CRM | Tambah/edit, search, filter tahap | CRUD, search, tahap, tindak lanjut dan jatuh tempo |
| Keuangan | Omzet/kas/biaya terpisah | Tetap terpisah, CRUD dan arus kas bersih; Won tidak menambah omzet |
| Roadmap | Tanggal mulai/checklist lokal | Delapan fase usulan tetap utuh, tersimpan dalam akun |
| Dokumen | Seluruh 18 dokumen tersedia | Isi utuh, pencarian, Markdown, unduh, dibatasi sesi |
| Keputusan | Tujuh fondasi dan input tiga status | Empat status yang diminta, sumber wajib, CRUD catatan kerja |
| Inventaris | Referensi statis | Inventaris pengguna CRUD serta referensi baca-saja |
| Impor | Ganti snapshot dengan validasi terbatas | v1/v2, batas ukuran, kalender, ID, enum, nominal, pratinjau server, konflik ID, gabung/ganti, revision CAS |
| Deployment | Site statis lama, belum terverifikasi | Konfigurasi Vercel Next.js; aktual menunggu akses |
| Mobile | Belum diuji browser pada laporan awal | Browser terisolasi dan screenshot desktop/mobile |

## Konteks bisnis

Identitas @somesea__, asal nama dari Samsi, personal branding dekat/natural, jasa digital AI-assisted dan stack-agnostic, target Rp5 juta/bulan, serta register sumber dan ketidakpastian tetap tersedia dalam 18 dokumen. Harga, paket, segmen, SOP, roadmap, dan aset lama yang belum terkonfirmasi tidak dipromosikan menjadi keputusan final. Nilai operasional awal kosong.

## Keputusan implementasi

JSONB aggregate dipilih untuk ruang kerja personal dengan impor snapshot atomik dan batas 2 MB. Ini PostgreSQL permanen, dengan validasi database dan isolasi pemilik. Untuk skala lebih besar atau analitik lintas entitas, pindahkan koleksi ke tabel relasional terpisah melalui migrasi berikutnya. Setiap pembaruan disertai revisi agar dua perangkat tidak saling menimpa diam-diam.

Status FINAL di catatan kerja adalah status yang diisi pemilik dengan sumber; bukan bukti verifikasi pasar. Dokumen sumber tetap menjadi bukti yang bisa dirujuk.

## Batas

Belum ada realtime push, backup otomatis, registrasi publik, pemulihan password mandiri, pengiriman pengingat, generator proposal, atau kalkulator harga. Tidak ada klaim pemulihan Business OS lama. Integrasi cloud dan URL produksi harus diverifikasi setelah akses tersedia.
