import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emptyState } from '../src/lib/model';
const repo = vi.hoisted(() => ({ load: vi.fn(), persist: vi.fn(), owner: vi.fn() }));
vi.mock('../src/lib/repository', () => repo);
vi.mock('../src/lib/supabase/server', () => ({ supabase: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
import { previewImport, commitImport, save } from '../src/app/actions';
let current = { state: emptyState(), revision: 1 };
beforeEach(() => {
  vi.clearAllMocks();
  current = { state: emptyState(), revision: 1 };
  repo.load.mockImplementation(async () => structuredClone(current));
  repo.persist.mockImplementation(async (state, revision) => ({ state, revision: revision + 1 }));
});
describe('server actions · validasi, pratinjau dan konfirmasi', () => {
  it('tidak menyimpan mutasi jika sesi ditolak', async () => {
    repo.load.mockRejectedValue(Error('Sesi berakhir.'));
    const result = await save({ kind: 'settings', tasks: [], road: [], start: '' }, 1);
    expect(result.ok).toBe(false);
    expect(repo.persist).not.toHaveBeenCalled();
  });
  it('menolak mutasi tanpa revisi cocok dan tanpa payload valid', async () => {
    expect((await save({ kind: 'settings', tasks: [], road: [], start: '' }, 0)).ok).toBe(false);
    expect((await save({ kind: 'entry', value: { id: 'a', value: -1 } }, 1)).ok).toBe(false);
    expect(repo.persist).not.toHaveBeenCalled();
  });
  it('pratinjau tidak menulis dan commit harus mengonfirmasi snapshot yang sama', async () => {
    const raw = JSON.stringify({ ...emptyState(), start: '2026-10-20' });
    const preview = await previewImport({ raw, mode: 'merge' });
    expect(preview.ok).toBe(true);
    expect(repo.persist).not.toHaveBeenCalled();
    if (!preview.ok) throw Error('Preview gagal');
    const { counts, ...data } = preview.data;
    expect((await commitImport({ ...data, raw, confirmation: 'IMPOR' })).ok).toBe(true);
    expect(repo.persist).toHaveBeenCalledOnce();
  });
  it('menolak commit saat file, cara impor, atau revisi berubah', async () => {
    const raw = JSON.stringify({ ...emptyState(), start: '2026-10-20' });
    const preview = await previewImport({ raw, mode: 'merge' });
    if (!preview.ok) throw Error('Preview gagal');
    const { counts, ...data } = preview.data;
    expect(
      (await commitImport({ ...data, raw: JSON.stringify(emptyState()), confirmation: 'IMPOR' }))
        .ok,
    ).toBe(false);
    expect((await commitImport({ ...data, raw, mode: 'replace', confirmation: 'IMPOR' })).ok).toBe(
      false,
    );
    current.revision++;
    expect((await commitImport({ ...data, raw, confirmation: 'IMPOR' })).ok).toBe(false);
    expect(repo.persist).not.toHaveBeenCalled();
  });
  it('menolak commit tanpa kata konfirmasi tepat', async () => {
    const result = await commitImport({
      raw: JSON.stringify(emptyState()),
      mode: 'replace',
      revision: 1,
      digest: 'a'.repeat(64),
      confirmation: 'ya',
    });
    expect(result.ok).toBe(false);
    expect(repo.persist).not.toHaveBeenCalled();
  });
  it('kegagalan penyimpanan tidak dilaporkan berhasil', async () => {
    repo.persist.mockRejectedValue(Error('Penyimpanan gagal.'));
    const result = await save({ kind: 'settings', tasks: [], road: [], start: '' }, 1);
    expect(result).toEqual({ ok: false, error: 'Penyimpanan gagal.' });
  });
});
