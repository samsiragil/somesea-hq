import { z } from 'zod';
import { stateSchema, emptyState, type State } from './model';
const legacySchema = stateSchema
  .omit({ assets: true, version: true })
  .extend({ version: z.literal(1) })
  .strict();
const envelope = z
  .object({
    format: z.literal('somesea-hq'),
    version: z.literal(2),
    exportedAt: z.string().datetime(),
    state: stateSchema,
  })
  .strict();
export function parseImport(raw: string): State {
  if (new TextEncoder().encode(raw).length > 2_000_000) throw Error('File melebihi 2 MB.');
  const value: unknown = JSON.parse(raw);
  const modern = envelope.safeParse(value);
  if (modern.success) return modern.data.state;
  const direct = stateSchema.safeParse(value);
  if (direct.success) return direct.data;
  const old = legacySchema.parse(value);
  return stateSchema.parse({ ...old, version: 2, assets: [] });
}
export type ImportMode = 'merge' | 'replace';
export function planImport(current: State, incoming: State, mode: ImportMode) {
  const result = mode === 'replace' ? structuredClone(incoming) : structuredClone(current);
  const counts: Record<
    string,
    { incoming: number; duplicates: number; added: number; conflicts: number }
  > = {};
  for (const k of ['leads', 'entries', 'decisions', 'assets'] as const) {
    const known = new Map<string, unknown>(current[k].map((x) => [x.id, x]));
    const duplicates = incoming[k].filter((x) => known.has(x.id));
    const added = incoming[k].filter((x) => !known.has(x.id));
    counts[k] = {
      incoming: incoming[k].length,
      duplicates: duplicates.length,
      added: added.length,
      conflicts: duplicates.filter((x) => JSON.stringify(known.get(x.id)) !== JSON.stringify(x))
        .length,
    };
    if (mode === 'merge') (result[k] as unknown[]).push(...added);
  }
  if (mode === 'merge') {
    result.tasks = [...new Set([...current.tasks, ...incoming.tasks])];
    result.road = [...new Set([...current.road, ...incoming.road])];
    result.start = current.start || incoming.start;
  }
  return { state: stateSchema.parse(result), counts, mode };
}
export function exportState(state: State) {
  return JSON.stringify({
    format: 'somesea-hq',
    version: 2,
    exportedAt: new Date().toISOString(),
    state: stateSchema.parse(state),
  });
}
export const initialSnapshot = () => ({ state: emptyState(), revision: 0 });
