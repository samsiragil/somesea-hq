import { z } from 'zod';

export const stages = [
  'Baru',
  'Dihubungi',
  'Discovery',
  'Qualified',
  'Proposal',
  'Won',
  'Lost',
  'Nurture',
] as const;
export const statuses = ['FINAL', 'USULAN', 'EKSPERIMEN', 'BELUM TERVERIFIKASI'] as const;
export const kinds = ['Omzet', 'Kas masuk', 'Biaya'] as const;
export const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(v + 'T00:00:00Z');
    return (
      !isNaN(d.getTime()) &&
      d.toISOString().slice(0, 10) === v &&
      v >= '2000-01-01' &&
      v <= '2200-12-31'
    );
  }, 'Tanggal tidak valid (2000–2200).');
const optionalDate = z.union([date, z.literal('')]);
const text = z.string().trim().min(1).max(500);
const id = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/);
const amount = z.number().int().min(0).max(1_000_000_000_000);
export const leadSchema = z
  .object({
    id,
    name: text,
    problem: text,
    stage: z.enum(stages),
    value: amount,
    next: z.string().max(500),
    date: optionalDate,
  })
  .strict();
export const entrySchema = z
  .object({ id, title: text, type: z.enum(kinds), value: amount.positive(), date })
  .strict();
export const decisionSchema = z
  .object({ id, title: text, status: z.enum(statuses), source: text })
  .strict();
export const assetSchema = z
  .object({
    id,
    title: text,
    status: z.enum(['TERSEDIA', 'USULAN', 'BELUM TERVERIFIKASI']),
    location: z.string().max(500),
    notes: z.string().max(2000),
  })
  .strict();
const unique = <T extends { id: string }>(arr: T[]) =>
  new Set(arr.map((x) => x.id)).size === arr.length;
export const stateSchema = z
  .object({
    version: z.literal(2),
    leads: z.array(leadSchema).max(2000).refine(unique, 'ID prospek berulang.'),
    entries: z.array(entrySchema).max(5000).refine(unique, 'ID transaksi berulang.'),
    decisions: z.array(decisionSchema).max(2000).refine(unique, 'ID keputusan berulang.'),
    assets: z.array(assetSchema).max(1000).refine(unique, 'ID aset berulang.'),
    tasks: z
      .array(z.number().int().min(0).max(2))
      .max(3)
      .refine((x) => new Set(x).size === x.length),
    road: z
      .array(z.number().int().min(0).max(7))
      .max(8)
      .refine((x) => new Set(x).size === x.length),
    start: optionalDate,
  })
  .strict();
export type State = z.infer<typeof stateSchema>;
export type Lead = z.infer<typeof leadSchema>;
export type Entry = z.infer<typeof entrySchema>;
export const emptyState = (): State => ({
  version: 2,
  leads: [],
  entries: [],
  decisions: [],
  assets: [],
  tasks: [],
  road: [],
  start: '',
});
export const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
export const money = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
export function totals(state: State, month: string) {
  const sum = (type: string) =>
    state.entries
      .filter((e) => e.type === type && e.date.slice(0, 7) === month)
      .reduce((a, e) => a + e.value, 0);
  const omzet = sum('Omzet'),
    cash = sum('Kas masuk'),
    cost = sum('Biaya');
  return {
    omzet,
    cash,
    cost,
    net: cash - cost,
    remaining: Math.max(0, 5_000_000 - omzet),
    percent: (omzet / 5_000_000) * 100,
  };
}
export const mutationSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('lead'), value: leadSchema }),
  z.object({ kind: z.literal('entry'), value: entrySchema }),
  z.object({ kind: z.literal('decision'), value: decisionSchema }),
  z.object({ kind: z.literal('asset'), value: assetSchema }),
  z.object({
    kind: z.literal('delete'),
    collection: z.enum(['leads', 'entries', 'decisions', 'assets']),
    id,
  }),
  z.object({
    kind: z.literal('settings'),
    start: optionalDate,
    tasks: stateSchema.shape.tasks,
    road: stateSchema.shape.road,
  }),
]);
export type Mutation = z.infer<typeof mutationSchema>;
export function mutate(state: State, input: unknown): State {
  const action = mutationSchema.parse(input);
  const next = structuredClone(state);
  if (action.kind === 'settings')
    Object.assign(next, { start: action.start, tasks: action.tasks, road: action.road });
  else if (action.kind === 'delete')
    next[action.collection] = next[action.collection].filter((x) => x.id !== action.id) as never;
  else {
    const collection = (
      { lead: 'leads', entry: 'entries', decision: 'decisions', asset: 'assets' } as const
    )[action.kind];
    const rows = next[collection] as Array<{ id: string }>;
    const index = rows.findIndex((x) => x.id === action.value.id);
    if (index < 0) rows.push(action.value);
    else rows[index] = action.value;
  }
  return stateSchema.parse(next);
}
export const roadmap = [
  [
    '01–07',
    'Rapikan fondasi',
    'Tinjau keputusan, pilih kapasitas dan satu penawaran. Susun 10 calon prospek relevan.',
  ],
  ['08–14', 'Tunjukkan bukti awal', 'Buat satu demo berlabel data contoh dan mulai discovery.'],
  [
    '15–21',
    'Dengarkan kebutuhan',
    'Upayakan lima discovery. Catat masalah, anggaran, dan keberatan.',
  ],
  [
    '22–30',
    'Uji penawaran',
    'Kirim proposal untuk prospek yang cocok. Evaluasi pesan dan lingkup.',
  ],
  ['31–45', 'Delivery terkontrol', 'Jalankan SOP pada deal pertama; ukur waktu dan biaya aktual.'],
  ['46–60', 'Bangun bukti hasil', 'Selesaikan milestone dan minta izin studi kasus.'],
  ['61–75', 'Ulangi yang bekerja', 'Fokus pada kanal yang membawa prospek cocok.'],
  [
    '76–90',
    'Stabilkan operasi',
    'Evaluasi target omzet dan pilih tool berdasarkan hambatan nyata.',
  ],
];
export const foundations = [
  ['Handle @somesea__', 'S-02 · Koreksi langsung dari Sams.'],
  ['Somesea berasal dari pelesetan Samsi', 'S-02 · Filosofi personal brand.'],
  ['Personal branding yang dekat dan natural', 'S-03 · Preferensi Sams.'],
  ['Somesea HQ sebagai pusat kerja', 'S-01 · Permintaan Sams.'],
  ['Jasa digital AI-assisted, stack-agnostic', 'S-01 · Arah bisnis.'],
  ['Target omzet Rp5 juta per bulan', 'S-01 · Target, bukan pendapatan aktual.'],
  ['Satukan komponen operasional bisnis', 'S-01 · Roadmap, CRM, SOP, dashboard, dan inventaris.'],
];
