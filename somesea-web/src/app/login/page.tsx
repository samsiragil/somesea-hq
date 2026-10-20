import { configured, supabase } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Login from './login';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const ready = configured();
  if (ready) {
    const db = await supabase();
    const { data } = await db.auth.getUser();
    if (data.user) redirect('/');
  }
  return <Login configured={ready} />;
}
