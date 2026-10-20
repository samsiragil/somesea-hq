# Somesea HQ · Web interaktif

Versi web 0.1.0 · 20 Oktober 2026

## Membuka

Buka `../Somesea-HQ-Interaktif.html` di browser. File ini memuat seluruh aplikasi dan 18 dokumen dalam satu berkas. Folder `dist` berisi versi terpisah untuk hosting.

## Fitur

- Overview dengan target Rp5 juta dan ringkasan data yang benar-benar dicatat.
- CRM: tambah/edit prospek, pencarian, filter tahap, dan tanggal tindak lanjut.
- Roadmap: pilih tanggal mulai dan tandai fase selesai.
- Keuangan: tambah/edit omzet, kas masuk, dan biaya secara terpisah.
- Pustaka: baca dan unduh 18 dokumen HQ asli.
- Decision log: tujuh keputusan terkonfirmasi dan pencatatan keputusan baru.
- Inventaris: tools tersedia dan rencana tools berikutnya.
- Ekspor/impor data JSON dengan validasi serta konfirmasi sebelum mengganti data.

## Penyimpanan

Data interaktif disimpan di localStorage pada browser dan alamat yang sedang digunakan. Belum ada database cloud atau sinkronisasi lintas perangkat. Membuka alamat lain, berpindah browser, menghapus data browser, atau memindahkan file lokal dapat membuat data lama tidak terbaca pada lokasi baru. Gunakan ekspor sebelum berpindah dan impor pada lokasi baru.

Mode file lokal mengikuti kebijakan penyimpanan browser. Jika muncul pesan gagal menyimpan, ekspor sebelum menutup. Font memakai Google Fonts bila jaringan tersedia, dengan font sistem sebagai fallback.

Dokumen sumber bersifat baca-saja di web. Perubahan melalui CRM, ledger, roadmap, atau log keputusan disimpan dalam data browser dan ekspor JSON, bukan ditulis kembali ke dokumen Markdown.

## Status verifikasi dan hosting

Pemeriksaan logika berhasil untuk tujuh halaman, 18 dokumen, escaping input, pemisahan omzet/kas, penyimpanan, dan penolakan impor tidak valid. Pemeriksaan visual browser belum selesai karena pratinjau lokal tidak dapat dijangkau.

Site privat telah didaftarkan, tetapi source belum berhasil dikirim dan belum ada deployment yang terverifikasi. Publikasi tertahan oleh penolakan izin eksekusi otomatis. Jangan menganggap expected URL sebagai tautan live.

ID Site dipertahankan pada `.openai/hosting.json` agar publikasi berikutnya memakai Site yang sama.
