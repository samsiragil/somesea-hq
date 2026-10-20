import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.goto('/');
});
test('dashboard kosong, 7 navigasi, 18 dokumen, dan tanpa overflow', async ({ page }, info) => {
  await expect(page.getByRole('heading', { name: 'Selamat datang, Sams.' })).toBeVisible();
  await expect(page.getByText('Belum ada omzet yang dicatat bulan ini.')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => innerWidth)).toBe(page.viewportSize()!.width);
  await page.screenshot({
    path: `test-results/${info.project.name}-dashboard.png`,
    fullPage: true,
  });
  for (const name of [
    'CRM & penjualan',
    'Roadmap 90 hari',
    'Keuangan',
    'Pustaka HQ',
    'Decision log',
    'Tools & aset',
  ]) {
    await page
      .getByRole('navigation', { name: 'Navigasi utama' })
      .getByRole('link', { name, exact: true })
      .click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.getByRole('link', { name: 'Pustaka HQ', exact: true }).click();
  await expect(page.getByText('18 dokumen sumber')).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Daftar dokumen' }).getByRole('button'),
  ).toHaveCount(18);
  await page.screenshot({ path: `test-results/${info.project.name}-library.png`, fullPage: true });
});
test('CRM CRUD, pencarian, filter, dan tindak lanjut', async ({ page }) => {
  await page.getByRole('button', { name: 'Tambah prospek', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nama / usaha').fill('Hanya pengujian');
  await dialog.getByLabel('Kebutuhan atau masalah').fill('Uji CRM');
  await dialog.getByLabel('Tindakan berikutnya').fill('Telepon');
  await dialog.getByLabel('Tanggal tindak lanjut').fill('2026-01-01');
  await dialog.getByRole('button', { name: 'Simpan perubahan' }).click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole('link', { name: 'CRM & penjualan' }).click();
  await expect(page.getByText('Hanya pengujian', { exact: true })).toBeVisible();
  await page.getByLabel('Cari prospek').fill('tidak cocok');
  await expect(page.getByText('Tidak ada hasil yang cocok.')).toBeVisible();
  await page.getByLabel('Cari prospek').fill('');
  await page.getByLabel('Filter tahap').selectOption('Won');
  await expect(page.getByText('Tidak ada hasil yang cocok.')).toBeVisible();
  await page.getByLabel('Filter tahap').selectOption('');
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await dialog.getByLabel('Tahap').selectOption('Proposal');
  await dialog.getByRole('button', { name: 'Simpan perubahan' }).click();
  await expect(page.getByRole('cell', { name: 'Proposal', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Hapus', exact: true }).click();
  await dialog.getByRole('button', { name: 'Hapus catatan', exact: true }).click();
  await expect(page.getByText('CRM siap untuk prospek pertamamu.')).toBeVisible();
});
test('ledger membedakan omzet dan kas serta form validasi', async ({ page }) => {
  await page.getByRole('link', { name: 'Keuangan', exact: true }).click();
  for (const [type, value] of [
    ['Omzet', '5000000'],
    ['Kas masuk', '2000000'],
    ['Biaya', '300000'],
  ]) {
    await page.getByRole('button', { name: 'Catat transaksi' }).click();
    const d = page.getByRole('dialog');
    await d.getByLabel('Uraian / proyek').fill('Pengujian ' + type);
    await d.getByLabel('Jenis catatan').selectOption(type);
    await d.getByLabel('Nilai (Rp)', { exact: true }).fill(value);
    await d.getByLabel('Tanggal', { exact: true }).fill('2026-10-20');
    await d.getByRole('button', { name: 'Simpan perubahan' }).click();
    await expect(d).not.toBeVisible();
  }
  await page.getByLabel('Bulan laporan').fill('2026-10');
  await expect(page.locator('.finance-stats').getByText(/1.700.000/)).toBeVisible();
  await page.screenshot({
    path: 'test-results/finance-' + test.info().project.name + '.png',
    fullPage: true,
  });
});
test('impor v1 memerlukan pratinjau dan konfirmasi, ekspor v2 utuh', async ({ page }) => {
  await page.getByRole('link', { name: 'Data & cadangan' }).click();
  const old = {
    version: 1,
    leads: [
      {
        id: 'old',
        name: 'Pengujian migrasi',
        problem: 'Uji',
        stage: 'Baru',
        value: 0,
        next: '',
        date: '',
      },
    ],
    entries: [],
    decisions: [],
    tasks: [1],
    road: [2],
    start: '2026-10-20',
  };
  await page
    .getByLabel('Pilih cadangan JSON')
    .setInputFiles({
      name: 'v1.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(old)),
    });
  await page.getByRole('button', { name: 'Pratinjau cadangan' }).click();
  await expect(page.getByRole('heading', { name: 'Pratinjau sebelum menyimpan' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Konfirmasi impor' })).toBeDisabled();
  await page.getByLabel('Ketik IMPOR untuk mengonfirmasi').fill('IMPOR');
  await page.getByRole('button', { name: 'Konfirmasi impor' }).click();
  await expect(page.getByRole('status')).toContainText('Impor selesai');
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Ekspor data JSON' }).click();
  const file = await downloading;
  const stream = await file.createReadStream();
  let raw = '';
  for await (const chunk of stream!) raw += chunk.toString();
  const exported = JSON.parse(raw);
  expect(exported.state.leads[0].id).toBe('old');
  expect(exported.version).toBe(2);
  expect(exported.state.road).toEqual([2]);
});
test('halaman produksi menolak sesi kosong dan tidak menyajikan pustaka privat', async ({
  page,
}) => {
  await page.goto('http://127.0.0.1:4174/');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Masuk ke ruangmu.' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('menunggu koneksi Supabase');
  const response = await page.request.get('http://127.0.0.1:4174/src/content/documents.json');
  expect(response.status()).toBe(404);
  expect(await response.text()).not.toContain('S-02, pesan pengguna');
  await page.screenshot({
    path: 'test-results/login-' + test.info().project.name + '.png',
    fullPage: true,
  });
});
test('roadmap, keputusan empat status, dan inventaris CRUD', async ({ page }) => {
  await page.getByRole('link', { name: 'Roadmap 90 hari', exact: true }).click();
  await page.getByLabel('Tanggal mulai roadmap').fill('2026-11-01');
  await page.getByRole('checkbox', { name: 'Fase selesai' }).first().check();
  await page.getByRole('button', { name: 'Muat ulang data' }).click();
  await expect(page.getByLabel('Tanggal mulai roadmap')).toHaveValue('2026-11-01');
  await expect(page.getByRole('checkbox', { name: 'Fase selesai' }).first()).toBeChecked();
  await page.getByRole('link', { name: 'Decision log', exact: true }).click();
  await page.getByRole('button', { name: 'Catat keputusan' }).click();
  const d = page.getByRole('dialog');
  await d.getByLabel('Keputusan / ide').fill('Keputusan hanya pengujian');
  await d.getByLabel('Status', { exact: true }).selectOption('BELUM TERVERIFIKASI');
  await d.getByLabel('Sumber persetujuan atau alasan').fill('Bukti belum tersedia');
  await d.getByRole('button', { name: 'Simpan perubahan' }).click();
  await expect(page.getByText('Keputusan hanya pengujian', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await d.getByLabel('Status', { exact: true }).selectOption('EKSPERIMEN');
  await d.getByRole('button', { name: 'Simpan perubahan' }).click();
  await page.getByLabel('Filter status keputusan').selectOption('FINAL');
  await expect(page.getByText('Keputusan hanya pengujian', { exact: true })).toHaveCount(0);
  await page.getByLabel('Filter status keputusan').selectOption('');
  await page.getByRole('button', { name: 'Hapus', exact: true }).click();
  await d.getByRole('button', { name: 'Hapus catatan', exact: true }).click();
  await page.getByRole('link', { name: 'Tools & aset', exact: true }).click();
  await page.getByRole('button', { name: 'Catat aset' }).click();
  await d.getByLabel('Nama tool / aset').fill('Aset hanya pengujian');
  await d.getByLabel('Lokasi aset / pengelolaan akses').fill('Lokasi pengujian');
  await d.getByRole('button', { name: 'Simpan perubahan' }).click();
  await expect(page.getByText('Aset hanya pengujian', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await d.getByLabel('Status', { exact: true }).selectOption('TERSEDIA');
  await d.getByRole('button', { name: 'Simpan perubahan' }).click();
  await page.getByRole('button', { name: 'Hapus', exact: true }).click();
  await d.getByRole('button', { name: 'Hapus catatan', exact: true }).click();
  await expect(page.getByText('Aset hanya pengujian', { exact: true })).toHaveCount(0);
});
test('impor rusak ditolak dan ganti memerlukan konfirmasi cadangan', async ({ page }) => {
  await page.getByRole('link', { name: 'Data & cadangan' }).click();
  await page
    .getByLabel('Pilih cadangan JSON')
    .setInputFiles({ name: 'rusak.json', mimeType: 'application/json', buffer: Buffer.from('{') });
  await page.getByRole('button', { name: 'Pratinjau cadangan' }).click();
  await expect(page.getByRole('alert')).toContainText('JSON tidak valid');
  await page
    .getByLabel('Pilih cadangan JSON')
    .setInputFiles({
      name: 'kosong.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({
          version: 1,
          leads: [],
          entries: [],
          tasks: [],
          road: [],
          decisions: [],
          start: '',
        }),
      ),
    });
  await page.getByLabel('Cara impor').selectOption('replace');
  await page.getByRole('button', { name: 'Pratinjau cadangan' }).click();
  await page.getByLabel('Ketik IMPOR untuk mengonfirmasi').fill('IMPOR');
  await expect(page.getByRole('button', { name: 'Konfirmasi impor' })).toBeDisabled();
  await page.getByLabel('Saya sudah menyimpan cadangan data saat ini.').check();
  await expect(page.getByRole('button', { name: 'Konfirmasi impor' })).toBeEnabled();
});
