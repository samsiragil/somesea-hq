// Fixture pengujian terpisah. Tidak diimpor atau diterbitkan oleh Next.js.
import React from 'react';
import { createRoot } from 'react-dom/client';
import Workspace, { type WorkspaceActions } from '../../src/components/workspace';
import { emptyState, mutate, type State } from '../../src/lib/model';
import { parseImport, planImport, exportState } from '../../src/lib/import';
import documents from '../../src/content/documents.json';
import '../../src/app/globals.css';
let current = { state: emptyState(), revision: 0 };
const success = <T,>(data: T) => ({ ok: true as const, data });
const fail = (error: string) => ({ ok: false as const, error });
const actions: WorkspaceActions = {
  async refresh() {
    return success(structuredClone(current));
  },
  async save(input, revision) {
    if (revision !== current.revision) return fail('Konflik revisi pengujian.');
    try {
      current = { state: mutate(current.state, input), revision: revision + 1 };
      return success(structuredClone(current));
    } catch {
      return fail('Data tidak valid.');
    }
  },
  async downloadExport() {
    return success(exportState(current.state));
  },
  async previewImport(input) {
    try {
      const { raw, mode } = input as { raw: string; mode: 'merge' | 'replace' };
      const plan = planImport(current.state, parseImport(raw), mode);
      return success({
        counts: plan.counts,
        mode,
        revision: current.revision,
        digest: 'a'.repeat(64),
      });
    } catch {
      return fail('JSON tidak valid.');
    }
  },
  async commitImport(input) {
    const p = input as { raw: string; mode: 'merge' | 'replace'; revision: number };
    if (p.revision !== current.revision) return fail('Data berubah.');
    current = {
      state: planImport(current.state, parseImport(p.raw), p.mode).state,
      revision: current.revision + 1,
    };
    return success(structuredClone(current));
  },
  async signOut() {
    throw Error('Keluar tidak tersedia pada fixture uji.');
  },
};
createRoot(document.getElementById('root')!).render(
  <Workspace
    initial={current}
    documents={documents}
    email="ui-test@example.invalid"
    actions={actions}
  />,
);
