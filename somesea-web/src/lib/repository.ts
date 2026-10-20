import 'server-only';
import { supabase } from './supabase/server';
import { stateSchema, emptyState, type State } from './model';
export async function owner() {
  const db = await supabase();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) throw Error('Sesi berakhir. Silakan masuk kembali.');
  return { db, user: data.user };
}
export async function load() {
  const { db, user } = await owner();
  const { data, error } = await db
    .from('workspaces')
    .select('data,revision')
    .eq('owner_id', user.id)
    .maybeSingle();
  if (error) throw Error('Database belum siap atau koneksi gagal. Periksa migrasi dan coba lagi.');
  return {
    state: data ? stateSchema.parse(data.data) : emptyState(),
    revision: data?.revision ?? 0,
  };
}
export async function persist(state: State, revision: number) {
  const parsed = stateSchema.parse(state);
  if (Buffer.byteLength(JSON.stringify(parsed), 'utf8') > 1_900_000)
    throw Error('Data mendekati batas 2 MB. Arsipkan catatan sebelum menambah data.');
  const { db } = await owner();
  const { data, error } = await db.rpc('save_workspace', {
    payload: parsed,
    expected_revision: revision,
  });
  if (error) {
    if (error.message.includes('REVISION_CONFLICT'))
      throw Error('Data berubah di perangkat lain. Muat ulang sebelum menyimpan.');
    throw Error('Penyimpanan gagal. Tidak ada perubahan yang dikonfirmasi.');
  }
  return { state: parsed, revision: Number(data) };
}
