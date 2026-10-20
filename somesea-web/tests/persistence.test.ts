import { PGlite } from '@electric-sql/pglite';
import { mkdir, mkdtemp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { it, expect } from 'vitest';
it('PostgreSQL disk mempertahankan data setelah koneksi ditutup dan dibuka', async () => {
  const root = resolve('test-results');
  await mkdir(root, { recursive: true });
  const dataDir = await mkdtemp(resolve(root, 'persistence-'));
  const first = new PGlite(dataDir);
  await first.exec('create table persistence_probe(id int primary key, payload jsonb not null)');
  await first.query('insert into persistence_probe values(1,$1::jsonb)', [
    JSON.stringify({ onlyTest: true, omzet: 5000000, cash: 2000000 }),
  ]);
  await first.close();
  const reopened = new PGlite(dataDir);
  try {
    expect(
      (
        await reopened.query<{ payload: unknown }>(
          'select payload from persistence_probe where id=1',
        )
      ).rows[0].payload,
    ).toEqual({ onlyTest: true, omzet: 5000000, cash: 2000000 });
  } finally {
    await reopened.close();
  }
});
