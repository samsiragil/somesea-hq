import { createClient } from '@supabase/supabase-js';
import { describe, it, expect } from 'vitest';
// Hanya akun pengujian terpisah. Jangan gunakan akun Sams atau data produksi.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const emails = [process.env.SUPABASE_TEST_EMAIL_A, process.env.SUPABASE_TEST_EMAIL_B],
  passwords = [process.env.SUPABASE_TEST_PASSWORD_A, process.env.SUPABASE_TEST_PASSWORD_B];
const ready =
  process.env.RUN_LIVE_AUTH_TESTS === '1' &&
  !!url &&
  !!key &&
  emails.every(Boolean) &&
  passwords.every(Boolean);
describe.skipIf(!ready)('Supabase Auth langsung · dua akun uji', () => {
  it('login, refresh, logout, dan isolasi read antar akun', async () => {
    const a = createClient(url!, key!, {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
      b = createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } });
    try {
      const loginA = await a.auth.signInWithPassword({
        email: emails[0]!,
        password: passwords[0]!,
      });
      const loginB = await b.auth.signInWithPassword({
        email: emails[1]!,
        password: passwords[1]!,
      });
      expect(loginA.error).toBeNull();
      expect(loginB.error).toBeNull();
      const idA = loginA.data.user!.id,
        idB = loginB.data.user!.id;
      expect(idA).not.toBe(idB);
      const readA = await a.from('workspaces').select('owner_id').eq('owner_id', idB),
        readB = await b.from('workspaces').select('owner_id').eq('owner_id', idA);
      expect(readA.error).toBeNull();
      expect(readB.error).toBeNull();
      expect(readA.data).toEqual([]);
      expect(readB.data).toEqual([]);
      expect((await a.auth.refreshSession()).error).toBeNull();
      expect((await a.auth.getUser()).data.user?.id).toBe(idA);
      expect((await a.auth.signOut()).error).toBeNull();
      expect((await a.auth.getUser()).data.user).toBeNull();
    } finally {
      await a.auth.signOut();
      await b.auth.signOut();
    }
  });
});
