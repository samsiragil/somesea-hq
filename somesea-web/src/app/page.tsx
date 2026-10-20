import { redirect } from 'next/navigation';
import { configured, supabase } from '@/lib/supabase/server';
import { load } from '@/lib/repository';
import documents from '@/content/documents.json';
import Workspace from '@/components/workspace';
import * as actions from './actions';
export const dynamic = 'force-dynamic';
export default async function Page() {
  if (!configured()) redirect('/login');
  const db = await supabase();
  const { data } = await db.auth.getUser();
  if (!data.user) redirect('/login');
  const initial = await load();
  return (
    <Workspace
      initial={initial}
      documents={documents}
      email={data.user.email ?? ''}
      actions={actions}
    />
  );
}
