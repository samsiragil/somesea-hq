import { describe, it, expect } from 'vitest';
import { emptyState, mutate, stateSchema, totals, date } from '../src/lib/model';
import { parseImport, planImport, exportState } from '../src/lib/import';
const lead = {
  id: 'legacy-1',
  name: 'Prospek uji saja',
  problem: 'Kebutuhan pengujian',
  stage: 'Baru' as const,
  value: 0,
  next: 'Tindak lanjut',
  date: '2026-10-20',
};
describe('keuangan dan validasi', () => {
  it('memisahkan omzet, DP, biaya, dan bulan', () => {
    const s = emptyState();
    s.entries = [
      { id: 'o', title: 'Pekerjaan uji', type: 'Omzet', value: 5000000, date: '2026-10-01' },
      { id: 'c', title: 'DP uji', type: 'Kas masuk', value: 2000000, date: '2026-10-02' },
      { id: 'b', title: 'Biaya uji', type: 'Biaya', value: 300000, date: '2026-10-03' },
      { id: 'x', title: 'Bulan lain', type: 'Omzet', value: 900000, date: '2026-09-01' },
    ];
    expect(totals(s, '2026-10')).toEqual({
      omzet: 5000000,
      cash: 2000000,
      cost: 300000,
      net: 1700000,
      percent: 100,
      remaining: 0,
    });
  });
  it('tidak membuat omzet dari Won', () => {
    const s = mutate(emptyState(), {
      kind: 'lead',
      value: { ...lead, stage: 'Won', value: 5000000 },
    });
    expect(totals(s, '2026-10').omzet).toBe(0);
  });
  it.each(['2026-02-30', '2026-13-01', '2025-02-29', '1999-12-31'])('menolak tanggal %s', (v) =>
    expect(date.safeParse(v).success).toBe(false),
  );
  it('menerima hari kabisat', () => expect(date.safeParse('2028-02-29').success).toBe(true));
  it('menolak nominal nonfinite, pecahan, negatif, dan berlebihan', () => {
    for (const value of [NaN, Infinity, -1, 0.5, 1e15])
      expect(() => mutate(emptyState(), { kind: 'lead', value: { ...lead, value } })).toThrow();
  });
  it('CRUD tidak mengubah state sumber', () => {
    const original = emptyState();
    const created = mutate(original, { kind: 'lead', value: lead });
    const updated = mutate(created, { kind: 'lead', value: { ...lead, name: 'Diubah' } });
    const removed = mutate(updated, { kind: 'delete', collection: 'leads', id: lead.id });
    expect(original.leads).toHaveLength(0);
    expect(created.leads[0].name).toBe(lead.name);
    expect(updated.leads[0].name).toBe('Diubah');
    expect(removed.leads).toHaveLength(0);
  });
  it('menerima empat status keputusan, menolak status palsu', () => {
    for (const status of ['FINAL', 'USULAN', 'EKSPERIMEN', 'BELUM TERVERIFIKASI'])
      expect(
        mutate(emptyState(), {
          kind: 'decision',
          value: { id: 'd', title: 'Uji', source: 'Sumber uji', status },
        }).decisions,
      ).toHaveLength(1);
    expect(() =>
      mutate(emptyState(), {
        kind: 'decision',
        value: { id: 'd', title: 'Uji', source: 'Sumber', status: 'SAH' },
      }),
    ).toThrow();
  });
});
describe('migrasi JSON', () => {
  it('migrasi v1 mempertahankan ID, tanggal, tugas, keputusan', () => {
    const { assets, version, ...rest } = emptyState();
    const result = parseImport(
      JSON.stringify({
        ...rest,
        version: 1,
        leads: [lead],
        tasks: [1],
        road: [2],
        start: '2026-10-20',
      }),
    );
    expect(result).toMatchObject({
      version: 2,
      assets: [],
      leads: [lead],
      tasks: [1],
      road: [2],
      start: '2026-10-20',
    });
  });
  it('ekspor dan impor v2 utuh', () => {
    const state = mutate(emptyState(), { kind: 'lead', value: lead });
    expect(parseImport(exportState(state))).toEqual(state);
  });
  it('gabung mempertahankan konflik ID dan melaporkannya', () => {
    const current = mutate(emptyState(), { kind: 'lead', value: lead });
    const incoming = mutate(emptyState(), { kind: 'lead', value: { ...lead, name: 'Berbeda' } });
    incoming.leads.push({ ...lead, id: 'baru' });
    const p = planImport(current, incoming, 'merge');
    expect(p.counts.leads).toEqual({ incoming: 2, duplicates: 1, conflicts: 1, added: 1 });
    expect(p.state.leads[0]).toEqual(lead);
    expect(p.state.leads).toHaveLength(2);
    expect(current.leads).toHaveLength(1);
  });
  it('ganti kosong benar-benar mengosongkan data tanpa menyentuh sumber', () => {
    const current = mutate(emptyState(), { kind: 'lead', value: lead });
    const p = planImport(current, emptyState(), 'replace');
    expect(p.state).toEqual(emptyState());
    expect(current.leads).toHaveLength(1);
  });
  it('gabung menggabungkan checklist dan mempertahankan tanggal mulai', () => {
    const a = { ...emptyState(), tasks: [0], road: [1], start: '2026-10-20' },
      b = { ...emptyState(), tasks: [0, 1], road: [1, 2], start: '2026-11-01' };
    expect(planImport(a, b, 'merge').state).toMatchObject({
      tasks: [0, 1],
      road: [1, 2],
      start: a.start,
    });
  });
  it('menolak JSON rusak, unknown keys, ID kembar dan file besar', () => {
    expect(() => parseImport('{')).toThrow();
    expect(() => parseImport(JSON.stringify({ ...emptyState(), owner_id: 'asing' }))).toThrow();
    expect(() => parseImport(JSON.stringify({ ...emptyState(), leads: [lead, lead] }))).toThrow();
    expect(() => parseImport(' '.repeat(2000001))).toThrow();
  });
  it('tidak menganggap dokumen atau aset sebagai transaksi', () => {
    expect(stateSchema.parse(emptyState())).toEqual({
      version: 2,
      leads: [],
      entries: [],
      decisions: [],
      assets: [],
      tasks: [],
      road: [],
      start: '',
    });
  });
});
