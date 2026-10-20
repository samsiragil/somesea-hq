# SOP delivery

Versi 0.1.0 · **USULAN prosedur**, belum dikonfirmasi sebagai SOP historis.

Pemilik seluruh langkah saat ini: Sams. Bila melibatkan orang lain, tentukan tanggung jawab dan akses secara tertulis.

| Langkah | Tindakan | Bukti selesai |
|---|---|---|
| Intake | Tautkan lead, catat kebutuhan dan risiko, pastikan kapasitas | Brief terisi |
| Scope | Tetapkan deliverable, batas, acceptance criteria, biaya, jadwal, dan revisi | Proposal versi disetujui |
| Kickoff | Konfirmasi syarat pembayaran, materi, akses minimum, dan kanal komunikasi | Checklist kickoff lengkap |
| Pilih solusi | Bandingkan opsi stack menurut kebutuhan dan pemeliharaan | Catatan keputusan teknologi |
| Bangun | Kerjakan milestone kecil; catat perubahan dan bantuan AI yang relevan | Demo yang dapat diperiksa |
| QA | Periksa alur utama, kondisi gagal, perangkat yang disepakati, akses, dan data | Checklist uji beserta hasil |
| UAT | Klien menguji sesuai kriteria; klasifikasikan bug vs tambahan lingkup | Catatan penerimaan/perbaikan |
| Serah terima | Berikan file/akses, panduan, biaya berjalan, backup, dan batas dukungan | Daftar serah terima diterima |
| Tutup | Cocokkan tagihan/pembayaran; catat waktu dan biaya; minta umpan balik | Proyek ditutup dan arsip lengkap |

## Pemeriksaan minimum sebelum rilis

- Alur utama berhasil dari awal hingga hasil akhir.
- Input kosong/salah dan kegagalan layanan ditangani dengan pesan yang jelas.
- Jika ada login, akses data sesuai peran dan pengguna tidak dapat melihat data pihak lain.
- Tidak ada kredensial di file yang dibagikan atau kode publik.
- Data contoh dipisahkan dari data nyata.
- Tampilan berfungsi pada perangkat/browser yang masuk lingkup.
- Jika menyimpan data, ekspor/backup dan pemulihan diperiksa.
- Dependensi, hosting, domain, akun pemilik, serta biaya berjalan terdokumentasi.
- Klien menyetujui rilis dan tahu langkah bila terjadi gangguan.

Pilih pengujian sesuai risiko proyek. Checklist ini tidak menggantikan pemeriksaan khusus untuk sistem pembayaran, data sensitif, atau kebutuhan regulasi.

## Perubahan lingkup

Catat permintaan → jelaskan dampak biaya/jadwal → perbarui proposal/change request → minta persetujuan tertulis → kerjakan. Bug berarti perilaku menyimpang dari kriteria yang disetujui; fitur baru bukan otomatis bug.

## Gangguan setelah rilis

Catat waktu, dampak, pengguna terdampak, dan perubahan terakhir. Batasi dampak melalui rollback atau penghentian fitur jika perlu dan diizinkan. Beri pembaruan faktual, perbaiki, verifikasi, lalu dokumentasikan penyebab dan pencegahannya. Jangan menjanjikan respons 24/7 tanpa kesepakatan dukungan.

## Backup HQ

Usulan: setiap akhir minggu dan sebelum perubahan besar, salin seluruh folder HQ ke lokasi kedua yang dipilih Sams. Sesekali buka salinan untuk memeriksa pemulihan. Jangan memasukkan kata sandi/API key ke arsip. Belum ada backup otomatis yang diaktifkan.
