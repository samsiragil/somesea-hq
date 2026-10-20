# Migrasi ekspor JSON lama

Data pada browser lama tidak bisa dibaca otomatis dari origin atau perangkat lain. Buka aplikasi lama di browser yang menyimpan data → Ekspor. Jangan hapus localStorage atau sumber sebelum membandingkan hasil migrasi.

1. Masuk ke HQ baru dan ekspor data yang sudah ada.
2. Buka Data & cadangan. Pilih JSON maksimum 2 MB.
3. Pilih Gabung atau Ganti seluruh data operasional.
4. Tekan Pratinjau. Periksa jumlah catatan, ID sama, dan jumlah isi berbeda.
5. Pada mode Ganti, konfirmasikan bahwa cadangan saat ini sudah disimpan.
6. Ketik `IMPOR`, lalu Konfirmasi impor.
7. Tinjau CRM, bulan laporan keuangan, roadmap, keputusan, dan inventaris. Muat ulang dan ekspor lagi untuk perbandingan.

## Format yang diterima

- Ekspor aplikasi lama `{version:1,leads,entries,tasks,road,decisions,start}`.
- Snapshot v2 dengan tambahan `assets` dan `version:2`.
- Envelope ekspor baru `{format:"somesea-hq",version:2,exportedAt,state}`.

ID lama dipertahankan. Inventaris tidak ada di v1, sehingga menjadi kosong, bukan dianggap berhasil dipulihkan. Tanggal harus benar secara kalender dalam 2000–2200. Nominal adalah rupiah bulat: estimasi prospek boleh nol, transaksi harus positif. Tidak ada konversi tanggal atau nominal yang ambigu. Kolom tambahan, ID berulang dalam satu koleksi, status di luar enum, file terlalu besar, atau JSON rusak ditolak; sumber tidak diubah.

## Duplikasi dan penggantian

Gabung memakai ID per koleksi. ID yang sudah ada mempertahankan catatan sekarang, meskipun isi cadangan berbeda. Konflik ditampilkan agar Sams bisa memutuskan; tidak ada deduplikasi berdasarkan nama karena dua transaksi dengan nama sama mungkin memang berbeda. ID berbeda adalah catatan berbeda. Checklist tugas dan roadmap digabung, tanggal mulai saat ini dipertahankan kecuali kosong.

Ganti memakai seluruh snapshot dari cadangan. Koleksi kosong akan mengosongkan koleksi tujuan. Karena v1 tidak memiliki inventaris, mode Ganti dari v1 mengosongkan inventaris saat ini. Dokumen sumber dan referensi fondasi tetap utuh.

Server menghitung pratinjau dari snapshot terbaru, mengikat digest SHA-256 ke hasil rencana dan revisi. Pada konfirmasi, JSON divalidasi dan rencana dihitung ulang. Bila data atau revisi berubah, pengguna wajib membuat pratinjau lagi. RPC database memastikan penulisan atomik dan menolak revisi basi. Kegagalan tidak menghasilkan impor parsial.
