import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { emptyState } from '../src/lib/model';
const a = '11111111-1111-4111-8111-111111111111',
  b = '22222222-2222-4222-8222-222222222222';
let db: PGlite;
const asOwner = async (id: string) => {
  await db.exec(
    `reset role;set role authenticated;select set_config('request.jwt.claim.sub','${id}',false);`,
  );
};
const save = async (payload: unknown, revision: number) =>
  db.query<{ save_workspace: number }>('select public.save_workspace($1::jsonb,$2::bigint)', [
    JSON.stringify(payload),
    revision,
  ]);
describe.sequential('migrasi PostgreSQL nyata melalui PGlite · RLS dan transaksi', () => {
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${a}'),('${b}');create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`,
    );
    await db.exec(readFileSync('supabase/migrations/202610200001_workspace.sql', 'utf8'));
  });
  afterAll(async () => {
    await db.close();
  });
  it('anon tidak dapat membaca atau menyimpan', async () => {
    await db.exec('set role anon');
    await expect(db.query('select * from public.workspaces')).rejects.toThrow(/permission denied/i);
    await expect(save(emptyState(), 0)).rejects.toThrow(/permission denied/i);
  });
  it('akun A menyimpan dan membaca kembali', async () => {
    await asOwner(a);
    expect((await save(emptyState(), 0)).rows[0].save_workspace).toBe(1);
    expect(
      (await db.query<{ data: unknown }>('select data from public.workspaces')).rows[0].data,
    ).toEqual(emptyState());
  });
  it('akun B tidak dapat melihat atau mengubah akun A', async () => {
    await asOwner(b);
    expect((await db.query('select * from public.workspaces')).rows).toHaveLength(0);
    expect(
      (
        await db.query(
          'update public.workspaces set data=$1::jsonb where owner_id=$2 returning owner_id',
          [JSON.stringify(emptyState()), a],
        )
      ).rows,
    ).toHaveLength(0);
    await expect(
      db.query('insert into public.workspaces(owner_id,data) values($1,$2::jsonb)', [
        a,
        JSON.stringify(emptyState()),
      ]),
    ).rejects.toThrow(/row-level security/i);
    expect((await save(emptyState(), 0)).rows[0].save_workspace).toBe(1);
  });
  it('CAS menolak snapshot basi dan mempertahankan versi tersimpan', async () => {
    await asOwner(a);
    const changed = { ...emptyState(), start: '2026-10-20' };
    expect((await save(changed, 1)).rows[0].save_workspace).toBe(2);
    await expect(save(emptyState(), 1)).rejects.toThrow('REVISION_CONFLICT');
    const stored = (
      await db.query<{ data: typeof changed; revision: number }>(
        'select data,revision from public.workspaces',
      )
    ).rows[0];
    expect(stored.data.start).toBe('2026-10-20');
    expect(stored.revision).toBe(2);
  });
  it('menolak payload tidak valid dan penggantian gagal tetap atomik', async () => {
    await asOwner(a);
    for (const invalid of [
      { ...emptyState(), version: 1 },
      { ...emptyState(), start: '2026-02-30' },
      { ...emptyState(), tasks: [0, 0] },
      {
        ...emptyState(),
        entries: [{ id: 'x', title: 'Uji', type: 'Kas masuk', value: -1, date: '2026-10-20' }],
      },
      { ...emptyState(), decisions: [{ id: 'd', title: 'Uji', status: 'BOGUS', source: 'test' }] },
    ])
      await expect(save(invalid, 2)).rejects.toThrow('INVALID_PAYLOAD');
    expect(
      (await db.query<{ revision: number }>('select revision from public.workspaces')).rows[0]
        .revision,
    ).toBe(2);
  });
  it('validasi CHECK juga melindungi Data API langsung', async () => {
    await expect(
      db.query('update public.workspaces set data=$1::jsonb', [JSON.stringify({ version: 2 })]),
    ).rejects.toThrow(/check constraint/i);
  });
  it('pemilik tidak dapat diganti', async () => {
    await expect(db.query('update public.workspaces set owner_id=$1', [b])).rejects.toThrow(
      'OWNER_IMMUTABLE',
    );
  });
  it('trigger menaikkan revisi untuk pembaruan langsung', async () => {
    await db.query('update public.workspaces set data=$1::jsonb, revision=999', [
      JSON.stringify(emptyState()),
    ]);
    expect(
      (await db.query<{ revision: number }>('select revision from public.workspaces')).rows[0]
        .revision,
    ).toBe(3);
  });
  it('replace tidak menyentuh pemilik lain', async () => {
    await asOwner(b);
    expect(
      (await db.query<{ revision: number }>('select revision from public.workspaces')).rows[0]
        .revision,
    ).toBe(1);
  });
});
