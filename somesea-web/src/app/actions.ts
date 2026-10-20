'use server';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { load, persist, owner } from '@/lib/repository';
import { mutate } from '@/lib/model';
import { parseImport, planImport, exportState } from '@/lib/import';
import { supabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
async function safe<T>(operation: () => Promise<T>) {
  try {
    return { ok: true as const, data: await operation() };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof z.ZodError
          ? 'Data tidak valid. Periksa kolom, tanggal, nilai, atau ID berulang.'
          : error instanceof SyntaxError
            ? 'JSON tidak valid.'
            : error instanceof Error
              ? error.message
              : 'Operasi gagal.',
    };
  }
}
export async function refresh() {
  return safe(load);
}
export async function save(input: unknown, revision: number) {
  return safe(async () => {
    z.number().int().nonnegative().parse(revision);
    const current = await load();
    if (current.revision !== revision)
      throw Error('Data berubah di perangkat lain. Muat ulang sebelum menyimpan.');
    return persist(mutate(current.state, input), revision);
  });
}
function fingerprint(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
const importInput = z
  .object({ raw: z.string().max(2_000_000), mode: z.enum(['merge', 'replace']) })
  .strict();
export async function previewImport(input: unknown) {
  return safe(async () => {
    const { raw, mode } = importInput.parse(input);
    const current = await load();
    const plan = planImport(current.state, parseImport(raw), mode);
    return {
      counts: plan.counts,
      revision: current.revision,
      digest: fingerprint({ plan, revision: current.revision }),
      mode,
    };
  });
}
export async function commitImport(input: unknown) {
  return safe(async () => {
    const parsed = importInput
      .extend({
        revision: z.number().int().nonnegative(),
        digest: z.string().length(64),
        confirmation: z.literal('IMPOR'),
      })
      .parse(input);
    const current = await load();
    if (current.revision !== parsed.revision)
      throw Error('Data berubah sejak pratinjau. Ulangi pratinjau impor.');
    const plan = planImport(current.state, parseImport(parsed.raw), parsed.mode);
    if (fingerprint({ plan, revision: current.revision }) !== parsed.digest)
      throw Error('Pratinjau tidak sesuai. Ulangi pratinjau impor.');
    return persist(plan.state, current.revision);
  });
}
export async function downloadExport() {
  return safe(async () => exportState((await load()).state));
}
export async function signOut() {
  const { db } = await owner();
  const { error } = await db.auth.signOut();
  if (error) throw Error('Gagal keluar. Coba kembali.');
  redirect('/login');
}
export async function authenticate(input: unknown) {
  return safe(async () => {
    const { email, password } = z
      .object({ email: z.email().max(254), password: z.string().min(1).max(128) })
      .parse(input);
    const db = await supabase();
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw Error('Tidak dapat masuk. Periksa email dan kata sandi.');
    return true;
  });
}
