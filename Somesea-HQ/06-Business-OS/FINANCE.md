# Ledger operasional

Versi 0.1.0 · Template manual baru · Definisi operasional: USULAN

Mata uang: IDR. Format tanggal: YYYY-MM-DD. Gunakan ID unik agar tidak menghitung dua kali. Belum ada transaksi aktual.

## Pekerjaan/milestone diterima

Sumber omzet operasional berdasarkan tanggal diterima; bukan berdasarkan tanggal proposal atau pembayaran.

| ID penerimaan | ID proyek | Milestone | Tanggal diterima | Nilai Rp | Bukti penerimaan |
|---|---|---|---|---:|---|

## Tagihan

| ID invoice | ID proyek | Tanggal terbit | Jatuh tempo | Nilai Rp | Status/keterangan |
|---|---|---|---|---:|---|

## Pembayaran diterima

| ID pembayaran | ID invoice | ID proyek | Tanggal terima | Nilai Rp | Bukti |
|---|---|---|---|---:|---|

Jika pembayaran melunasi beberapa invoice, buat baris alokasi dengan ID berbeda dan total yang sama dengan bukti transfer. Jangan menyalin seluruh nilai transfer ke setiap invoice.

## Biaya

| ID biaya | ID proyek/umum | Tanggal | Keperluan | Kategori langsung/umum | Nilai Rp | Bukti |
|---|---|---|---|---|---:|---|

## Rekap bulanan manual

| Bulan YYYY-MM | Omzet diterima Rp | Kas masuk Rp | Biaya langsung Rp | Biaya umum Rp | Catatan |
|---|---:|---:|---:|---:|---|

Omzet bulan = jumlah nilai pekerjaan diterima dalam bulan tersebut. Kas bulan = jumlah pembayaran berdasarkan tanggal terima. Piutang per invoice = nilai invoice − seluruh pembayaran yang dialokasikan ke invoice itu sampai tanggal laporan. Periksa nilai negatif karena bisa berarti pembayaran lebih atau salah alokasi.

Catatan ini untuk pengendalian operasional internal. Perlakuan pajak dan pelaporan akuntansi belum ditetapkan dalam HQ.
