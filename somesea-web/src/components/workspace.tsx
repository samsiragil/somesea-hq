'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Markdown from 'react-markdown';
import Preparation from './preparation';
import ThemeToggle from './theme-toggle';
import remarkGfm from 'remark-gfm';
import {
  foundations,
  kinds,
  money,
  roadmap,
  stages,
  statuses,
  today,
  totals,
  type Lead,
  type Mutation,
  type State,
} from '@/lib/model';
import type * as serverActions from '@/app/actions';
import * as Icon from './icons';

type Snapshot = { state: State; revision: number };
type Document = { path: string; title: string; content: string };
export type WorkspaceActions = Pick<
  typeof serverActions,
  'save' | 'refresh' | 'previewImport' | 'commitImport' | 'downloadExport' | 'signOut'
>;
type Props = { initial: Snapshot; documents: Document[]; email: string; actions: WorkspaceActions };
// Explicit type keeps the server's success/error union intact at the boundary.
type Preview = Extract<
  Awaited<ReturnType<WorkspaceActions['previewImport']>>,
  { ok: true }
>['data'];
const navigation = [
  { id: 'home', title: 'Penyesuaian awal', short: 'Mulai', icon: Icon.Overview },
  { id: 'crm', title: 'CRM & penjualan', short: 'CRM', icon: Icon.People },
  { id: 'road', title: 'Roadmap 90 hari', short: 'Roadmap', icon: Icon.Route },
  { id: 'finance', title: 'Keuangan', short: 'Keuangan', icon: Icon.Wallet },
  { id: 'docs', title: 'Pustaka HQ', short: 'Pustaka', icon: Icon.Books },
  { id: 'decisions', title: 'Decision log', short: 'Keputusan', icon: Icon.Flag },
  { id: 'tools', title: 'Tools & aset', short: 'Tools', icon: Icon.Toolbox },
];
const dataPage = { id: 'data', title: 'Data & cadangan', short: 'Data', icon: Icon.Sync };
const tabs = navigation.slice(0, 4),
  more = [...navigation.slice(4), dataPage];
const referenceAssets = [
  ['Pustaka bisnis', 'TERSEDIA', '18 dokumen sumber dapat dibaca di Pustaka HQ.'],
  ['Business OS lama', 'BELUM TERVERIFIKASI', 'Berkas asli belum tersedia untuk rekonsiliasi.'],
  [
    'Tools lama dan image(1).png',
    'BELUM TERVERIFIKASI',
    'Nama, fungsi, dan lampiran belum diperiksa.',
  ],
  [
    'Langganan AI, hosting, dan domain',
    'BELUM TERVERIFIKASI',
    'Akun dan langganan eksternal belum diaudit.',
  ],
  ['Kalkulator harga dan kapasitas', 'USULAN', 'Menunggu catatan waktu dan biaya aktual.'],
  ['Generator proposal', 'USULAN', 'Menunggu penawaran yang telah dipakai berulang.'],
];
const titles: Record<string, [string, string]> = {
  home: [
    'Pelan dulu, rapikan pijakanmu.',
    'Satu langkah yang jelas setiap sesi. Fokus sekarang: menemukan ritme dan menyiapkan cara kerja yang nyaman.',
  ],
  crm: [
    'Relasi sebelum transaksi.',
    'Pahami kebutuhannya. Jaga percakapannya. Tentukan langkah berikutnya.',
  ],
  road: [
    'Rencana untuk tahap berikutnya.',
    'Referensi usulan 90 hari setelah penyesuaian awal. Mulai saat kapasitas dan latihanmu sudah cukup jelas; tanggal bukan ukuran kesiapan.',
  ],
  finance: ['Angka yang memberi arah.', 'Pisahkan nilai pekerjaan, uang yang diterima, dan biaya.'],
  docs: ['Fondasi yang bisa dirujuk.', 'Seluruh dokumen bisnis, dengan konteks dan sumbernya.'],
  decisions: [
    'Keputusan punya jejak.',
    'Bedakan yang sudah disepakati, yang diuji, dan yang belum pasti.',
  ],
  tools: [
    'Tools mengikuti kebutuhan.',
    'Catat yang benar-benar tersedia. Bangun dari hambatan nyata.',
  ],
  data: ['Data tetap milikmu.', 'Cadangkan, pindahkan, dan tinjau sebelum mengimpor.'],
};
const ranges = roadmap.map(([day]) => day.split('–').map(Number) as [number, number]);

const utc = (d: string) => new Date(d + 'T00:00:00Z');
const formatDate = (d: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('id-ID', { ...options, timeZone: 'UTC' }).format(utc(d));
const daysBetween = (from: string, to: string) =>
  Math.round((utc(to).getTime() - utc(from).getTime()) / 86_400_000);
const monthName = (month: string) => formatDate(month + '-01', { month: 'long', year: 'numeric' });

/** Posisi kapal di rute 90 hari berdasarkan tanggal mulai. */
function voyage(start: string, now: string) {
  if (!start) return { kind: 'unset', day: 0, index: -1 } as const;
  const day = daysBetween(start, now) + 1;
  if (day < 1) return { kind: 'before', day, index: -1 } as const;
  if (day > 90) return { kind: 'after', day, index: 7 } as const;
  return {
    kind: 'active',
    day,
    index: ranges.findIndex(([a, b]) => day >= a && day <= b),
  } as const;
}
function followUp(lead: Lead, now: string) {
  if (!lead.date) return { text: 'Tanpa tanggal', due: false };
  const short = formatDate(lead.date, { day: 'numeric', month: 'short' });
  const late = daysBetween(lead.date, now);
  if (late > 0) return { text: `Lewat ${late} hari · ${short}`, due: true };
  if (late === 0) return { text: `Hari ini · ${short}`, due: true };
  return { text: short, due: false };
}

const flagged = ['FINAL', 'USULAN', 'EKSPERIMEN', 'BELUM TERVERIFIKASI', 'TERSEDIA'];
/** Status dibedakan oleh bentuk bendera, selalu bersama label teks. */
function Badge({ children }: { children: string }) {
  if (flagged.includes(children))
    return (
      <span className="flag-label">
        <span
          aria-hidden="true"
          className={
            'flag ' +
            (children === 'FINAL' || children === 'TERSEDIA'
              ? 'final'
              : children === 'USULAN'
                ? 'usulan'
                : children === 'EKSPERIMEN'
                  ? 'eksperimen'
                  : 'unknown')
          }
        />
        {children}
      </span>
    );
  return (
    <span
      className={
        'chip' +
        (children === 'Won' || children === 'Omzet'
          ? ' depth'
          : children === 'Lost' || children === 'Biaya'
            ? ' muted'
            : children === 'Kas masuk'
              ? ' final'
              : '')
      }
    >
      {children}
    </span>
  );
}
function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="empty">
      <Icon.Harbor />
      <h3>{title}</h3>
      {children}
    </div>
  );
}
function download(name: string, content: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
type Editor =
  | { kind: 'lead' | 'entry' | 'decision' | 'asset'; value?: Record<string, unknown> }
  | {
      kind: 'delete';
      collection: 'leads' | 'entries' | 'decisions' | 'assets';
      id: string;
      title: string;
    }
  | null;

export default function Workspace({ initial, documents, email, actions }: Props) {
  const [snapshot, setSnapshot] = useState(initial),
    [page, setPage] = useState('home'),
    [month, setMonth] = useState(today().slice(0, 7));
  const [search, setSearch] = useState(''),
    [filter, setFilter] = useState(''),
    [dueOnly, setDueOnly] = useState(false),
    [docPath, setDocPath] = useState(documents[0]?.path ?? '');
  const [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(''),
    [error, setError] = useState(''),
    [editor, setEditor] = useState<Editor>(null);
  const [raw, setRaw] = useState(''),
    [fileName, setFileName] = useState(''),
    [mode, setMode] = useState<'merge' | 'replace'>('merge'),
    [preview, setPreview] = useState<Preview | null>(null);
  const [confirmation, setConfirmation] = useState(''),
    [backup, setBackup] = useState(false);
  const [sheet, setSheet] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    locked = useRef(false);
  const state = snapshot.state;
  useEffect(() => {
    const update = () => {
      const id = location.hash.slice(1);
      setPage([...navigation.map((n) => n.id), 'data'].includes(id) ? id : 'home');
      setSearch('');
      setFilter('');
      setSheet(false);
    };
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  useEffect(() => {
    if (!sheet) return;
    const close = (e: KeyboardEvent) => e.key === 'Escape' && setSheet(false);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [sheet]);
  useEffect(() => {
    if (editor) dialog.current?.showModal();
    else dialog.current?.close();
  }, [editor]);
  async function run<T>(
    fn: () => Promise<{ ok: true; data: T } | { ok: false; error: string }>,
    success: (data: T) => void,
  ) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await fn();
      if (result.ok) success(result.data);
      else setError(result.error);
    } catch {
      setError('Koneksi gagal. Periksa jaringan dan coba kembali.');
    } finally {
      setBusy(false);
      locked.current = false;
    }
  }
  async function reload() {
    await run(actions.refresh, (data) => {
      setSnapshot(data);
      setPreview(null);
      setNotice('Data terbaru sudah dimuat.');
    });
  }
  async function persist(input: Mutation, close = false) {
    await run(
      () => actions.save(input, snapshot.revision),
      (data) => {
        setSnapshot(data);
        setPreview(null);
        setNotice('Perubahan tersimpan di akunmu.');
        if (close) setEditor(null);
      },
    );
  }
  async function exportData() {
    await run(actions.downloadExport, (data) => {
      download(`somesea-hq-${today()}.json`, data);
      setNotice('Cadangan JSON berhasil dibuat. Simpan file di lokasi yang aman.');
    });
  }
  function signOut() {
    void run(
      async () => {
        await actions.signOut();
        return { ok: true, data: true };
      },
      () => {},
    );
  }
  const now = today();
  const report = totals(state, month),
    active = state.leads.filter((l) => !['Won', 'Lost'].includes(l.stage));
  const due = active.filter((l) => l.date && l.date <= now);
  const selectedDoc = documents.find((d) => d.path === docPath) ?? documents[0];
  const filteredLeads = state.leads.filter(
    (l) =>
      (!filter || l.stage === filter) &&
      (!dueOnly || due.some((d) => d.id === l.id)) &&
      `${l.name} ${l.problem} ${l.next}`.toLowerCase().includes(search.toLowerCase()),
  );
  const dataRecords =
    state.leads.length + state.entries.length + state.decisions.length + state.assets.length;
  const add = (kind: 'lead' | 'entry' | 'decision' | 'asset', value?: Record<string, unknown>) => {
    setError('');
    setEditor({ kind, value });
  };
  const remove = (
    collection: 'leads' | 'entries' | 'decisions' | 'assets',
    id: string,
    title: string,
  ) => setEditor({ kind: 'delete', collection, id, title });
  const current = page === 'data' ? dataPage : navigation.find((n) => n.id === page)!;

  // Rute 90 hari: posisi kapal, status tiap titik, dan titik yang sedang dibaca.
  const trip = voyage(state.start, now);
  const phaseStatus = (i: number) =>
    state.road.includes(i) ? 'done' : trip.kind === 'active' && i === trip.index ? 'now' : 'next';
  const monthControl = (
    <label className="month-label">
      Bulan
      <input
        aria-label="Bulan laporan"
        type="month"
        value={month}
        onChange={(e) => {
          if (e.target.value) setMonth(e.target.value);
        }}
      />
    </label>
  );
  const leadList = (rows: State['leads']) => (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Prospek / kebutuhan</th>
            <th>Tahap</th>
            <th>Tindak lanjut</th>
            <th className="numeric">Estimasi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((l) => {
            const next = followUp(l, now);
            return (
              <tr key={l.id}>
                <td>
                  <strong>{l.name}</strong>
                  <small>{l.problem}</small>
                </td>
                <td>
                  <Badge>{l.stage}</Badge>
                </td>
                <td>
                  {l.next || 'Belum ditentukan'}
                  <small className={next.due && active.includes(l) ? 'due' : ''}>{next.text}</small>
                </td>
                <td className="numeric">{l.value ? money(l.value) : 'belum ada'}</td>
                <td>
                  <div className="row-actions">
                    <button onClick={() => add('lead', l)}>Edit</button>
                    <button onClick={() => remove('leads', l.id, l.name)}>Hapus</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
  async function submitEditor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    if (editor.kind === 'delete') {
      await persist({ kind: 'delete', collection: editor.collection, id: editor.id }, true);
      return;
    }
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const value = { ...fields, id: editor.value?.id ?? crypto.randomUUID() };
    if (editor.kind === 'lead' || editor.kind === 'entry')
      Object.assign(value, { value: Number(fields.value) });
    await persist({ kind: editor.kind, value } as Mutation, true);
  }
  function field(
    name: string,
    label: string,
    type = 'text',
    required = true,
    defaultValue?: string | number,
  ) {
    return (
      <label key={name}>
        {label}
        <input
          name={name}
          type={type}
          required={required}
          maxLength={500}
          min={
            type === 'number'
              ? editor?.kind === 'entry'
                ? 1
                : 0
              : type === 'date'
                ? '2000-01-01'
                : undefined
          }
          max={type === 'number' ? 1_000_000_000_000 : type === 'date' ? '2200-12-31' : undefined}
          step={type === 'number' ? 1 : undefined}
          defaultValue={
            defaultValue ?? (editor && 'value' in editor ? String(editor.value?.[name] ?? '') : '')
          }
        />
      </label>
    );
  }
  function select(name: string, label: string, options: readonly string[], fallback?: string) {
    return (
      <label key={name}>
        {label}
        <select
          name={name}
          aria-label={label}
          defaultValue={
            editor && 'value' in editor
              ? String(editor.value?.[name] ?? fallback ?? options[0])
              : (fallback ?? options[0])
          }
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
    );
  }
  const primaryAction = ['crm', 'finance', 'decisions', 'tools'].includes(page) && (
    <button
      className="primary"
      onClick={() =>
        add(
          page === 'finance'
            ? 'entry'
            : page === 'decisions'
              ? 'decision'
              : page === 'tools'
                ? 'asset'
                : 'lead',
        )
      }
      disabled={busy}
    >
      <Icon.Plus />
      {page === 'finance'
        ? 'Catat transaksi'
        : page === 'decisions'
          ? 'Catat keputusan'
          : page === 'tools'
            ? 'Catat aset'
            : 'Tambah prospek'}
    </button>
  );
  return (
    <div className="app-shell">
      <aside className="rail">
        <a className="brand" href="#home">
          <Icon.Compass />
          <span>
            <span className="brand-name">somesea</span>
            <span className="brand-sub">HQ · RUANG KERJA</span>
          </span>
        </a>
        <nav aria-label="Navigasi utama">
          {navigation.map((n) => (
            <a href={'#' + n.id} key={n.id} aria-current={page === n.id ? 'page' : undefined}>
              <n.icon />
              {n.title}
            </a>
          ))}
        </nav>
        <div className="rail-bottom">
          <p className="motto">Pelan, tapi terarah.</p>
          <a href="#data" aria-current={page === 'data' ? 'page' : undefined}>
            <Icon.Sync /> Data & cadangan
          </a>
          <div className="profile">
            <span className="avatar" aria-hidden="true">
              S
            </span>
            <span className="profile-name">
              <strong>Sams</strong>
              <small>@somesea__</small>
            </span>
            <button
              className="icon-button"
              aria-label="Keluar"
              title={'Keluar dari ' + email}
              onClick={signOut}
              disabled={busy}
            >
              <Icon.SignOut />
            </button>
          </div>
        </div>
      </aside>
      <header className="mobile-bar">
        <a className="brand" href="#home">
          <Icon.Compass size={28} />
          <span className="brand-name">somesea</span>
        </a>
        <span className="avatar" aria-hidden="true">
          S
        </span>
      </header>
      <main id="main" className="main">
        <div className="main-content">
          <header className="intro">
            <div>
              <p className="eyebrow">
                {current.title} ·{' '}
                {formatDate(now, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {page === 'home' && ' · Fase persiapan'}
              </p>
              <h1>{titles[page][0]}</h1>
              {titles[page][1] && <p className="lede">{titles[page][1]}</p>}
            </div>
            <div className="intro-actions">
              <ThemeToggle />
              {primaryAction}
            </div>
          </header>
          {(notice || error) && (
            <div
              role={error ? 'alert' : 'status'}
              className={error ? 'notice error' : 'notice success'}
            >
              {error || notice}
              {error && (
                <button className="secondary" onClick={reload} disabled={busy}>
                  Muat ulang data
                </button>
              )}
            </div>
          )}
          {page === 'home' && <Preparation state={state} busy={busy} persist={persist} />}
          {page === 'crm' && (
            <>
              <div className="toolbar">
                <input
                  aria-label="Cari prospek"
                  type="search"
                  placeholder="Cari nama, kebutuhan, atau tindakan…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  aria-label="Filter tahap"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="">Semua tahap</option>
                  {stages.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={dueOnly}
                    onChange={(e) => setDueOnly(e.target.checked)}
                  />{' '}
                  Jatuh tempo
                </label>
                <span className="count">{filteredLeads.length} prospek</span>
              </div>
              <section className="card">
                {filteredLeads.length ? (
                  leadList(filteredLeads)
                ) : (
                  <Empty
                    title={
                      state.leads.length
                        ? 'Tidak ada hasil yang cocok.'
                        : 'CRM siap untuk prospek pertamamu.'
                    }
                  >
                    <p>Catatan relasi asli kamu akan muncul di sini.</p>
                  </Empty>
                )}
              </section>
              <p className="footnote">
                Won berarti penawaran disetujui. Catat pembayaran secara terpisah di Keuangan.
              </p>
            </>
          )}
          {page === 'road' && (
            <>
              <details className="card">
                <summary>Checklist awal dari rencana sebelumnya</summary>
                <p>
                  Catatan lama tetap tersedia. Checklist ini terpisah dari empat langkah penyesuaian
                  awal.
                </p>
                {[
                  'Tetapkan kapasitas dan tanggal mulai',
                  'Pilih satu penawaran untuk diuji',
                  'Catat prospek pertama dan tindak lanjut',
                ].map((label, i) => (
                  <label className="check-label" key={label}>
                    <input
                      type="checkbox"
                      disabled={busy}
                      checked={state.tasks.includes(i)}
                      onChange={(e) =>
                        persist({
                          kind: 'settings',
                          start: state.start,
                          road: state.road,
                          tasks: e.target.checked
                            ? [...state.tasks, i]
                            : state.tasks.filter((t) => t !== i),
                        })
                      }
                    />
                    {label}
                  </label>
                ))}
              </details>
              <div className="toolbar">
                <label className="inline-label">
                  Tanggal mulai
                  <input
                    type="date"
                    aria-label="Tanggal mulai roadmap"
                    value={state.start}
                    min="2000-01-01"
                    max="2200-12-31"
                    disabled={busy}
                    onChange={(e) =>
                      persist({
                        kind: 'settings',
                        tasks: state.tasks,
                        road: state.road,
                        start: e.target.value,
                      })
                    }
                  />
                </label>
                <Badge>USULAN</Badge>
                <span className="count">{state.road.length} dari 8 fase selesai</span>
              </div>
              <ol className="road-grid">
                {roadmap.map(([day, title, desc], i) => (
                  <li className={'road-card ' + phaseStatus(i)} key={day}>
                    <div className="road-number">
                      <span className="dot" aria-hidden="true" />
                      <span className="label">Hari {day}</span>
                    </div>
                    <div>
                      <h2>{title}</h2>
                      <p>{desc}</p>
                      <label className="check-label">
                        <input
                          type="checkbox"
                          checked={state.road.includes(i)}
                          disabled={busy}
                          onChange={(e) =>
                            persist({
                              kind: 'settings',
                              start: state.start,
                              tasks: state.tasks,
                              road: e.target.checked
                                ? [...state.road, i]
                                : state.road.filter((t) => t !== i),
                            })
                          }
                        />{' '}
                        Fase selesai
                      </label>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="footnote">
                Tanggal mulai belum ditetapkan sampai kamu mengisinya. Rincian evaluasi hari 30, 60,
                dan 90 tersedia di Pustaka HQ.
              </p>
            </>
          )}
          {page === 'finance' && (
            <>
              <div className="toolbar">{monthControl}</div>
              <div className="finance-stats">
                {[
                  ['Omzet', report.omzet],
                  ['Kas masuk', report.cash],
                  ['Biaya', report.cost],
                  ['Arus kas bersih', report.net],
                ].map(([name, amount]) => (
                  <article key={name} className="card">
                    <p className="label">{name}</p>
                    <strong className="reading">{money(Number(amount))}</strong>
                    <small>
                      {name === 'Arus kas bersih' ? 'Kas masuk dikurangi biaya' : monthName(month)}
                    </small>
                  </article>
                ))}
              </div>
              <section className="card">
                {state.entries.filter((e) => e.date.startsWith(month)).length ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Tanggal</th>
                          <th>Uraian / proyek</th>
                          <th>Jenis</th>
                          <th className="numeric">Nilai</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.entries
                          .filter((e) => e.date.startsWith(month))
                          .sort((a, b) => b.date.localeCompare(a.date))
                          .map((e) => (
                            <tr key={e.id}>
                              <td className="mono nowrap">{e.date}</td>
                              <td>
                                <strong>{e.title}</strong>
                              </td>
                              <td>
                                <Badge>{e.type}</Badge>
                              </td>
                              <td className="numeric">{money(e.value)}</td>
                              <td>
                                <div className="row-actions">
                                  <button onClick={() => add('entry', e)}>Edit</button>
                                  <button onClick={() => remove('entries', e.id, e.title)}>
                                    Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty title="Belum ada catatan bulan ini.">
                    <p>
                      Catat omzet saat pekerjaan diterima. Catat kas saat uang benar-benar masuk.
                    </p>
                  </Empty>
                )}
              </section>
              <div className="note">
                <strong>DP adalah kas, bukan tambahan omzet.</strong>
                <p>
                  Nilai pekerjaan dicatat sekali sebagai omzet. Arus kas bersih bukan laba. Angka di
                  HQ mengikuti catatanmu, dengan definisi operasional dari dokumen sumber.
                </p>
              </div>
            </>
          )}
          {page === 'docs' && (
            <>
              <div className="toolbar">
                <input
                  type="search"
                  aria-label="Cari dokumen"
                  placeholder="Cari dari 18 dokumen…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className="count">{documents.length} dokumen sumber</span>
              </div>
              <div className="library">
                <nav aria-label="Daftar dokumen" className="card">
                  {documents
                    .filter((d) =>
                      (d.title + ' ' + d.path + ' ' + d.content)
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    )
                    .map((d) => (
                      <button
                        key={d.path}
                        aria-current={selectedDoc?.path === d.path ? 'page' : undefined}
                        onClick={() => setDocPath(d.path)}
                      >
                        <small>{d.path.split('/')[0]}</small>
                        {d.title}
                      </button>
                    ))}
                </nav>
                <article className="card document">
                  <div className="document-head">
                    <span className="label">{selectedDoc?.path}</span>
                    <button
                      className="secondary"
                      onClick={() =>
                        download(
                          selectedDoc.path.split('/').pop()!,
                          selectedDoc.content,
                          'text/markdown',
                        )
                      }
                    >
                      <Icon.Download />
                      Unduh .md
                    </button>
                  </div>
                  <div className="prose">
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ href, children }) => {
                          const relative = href?.split('#')[0];
                          const base = selectedDoc.path.split('/').slice(0, -1);
                          for (const segment of relative?.split('/') ?? []) {
                            if (segment === '..') base.pop();
                            else if (segment !== '.') base.push(segment);
                          }
                          const match = documents.find((d) => d.path === base.join('/'));
                          return match ? (
                            <button className="inline-link" onClick={() => setDocPath(match.path)}>
                              {children}
                            </button>
                          ) : (
                            <span>
                              {children}
                              {href && <small> ({href})</small>}
                            </span>
                          );
                        },
                      }}
                    >
                      {selectedDoc?.content ?? ''}
                    </Markdown>
                  </div>
                </article>
              </div>
            </>
          )}
          {page === 'decisions' && (
            <>
              <div className="toolbar">
                <input
                  type="search"
                  aria-label="Cari keputusan"
                  placeholder="Cari keputusan atau sumber…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  aria-label="Filter status keputusan"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="">Semua status</option>
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <section className="card">
                <div className="card-head">
                  <h2>Catatan kerja</h2>
                  <span className="count">{state.decisions.length} catatan</span>
                </div>
                {state.decisions
                  .filter(
                    (d) =>
                      (!filter || d.status === filter) &&
                      (d.title + ' ' + d.source).toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((d) => (
                    <article className="record" key={d.id}>
                      <div>
                        <Badge>{d.status}</Badge>
                        <h3>{d.title}</h3>
                        <p>{d.source}</p>
                      </div>
                      <div className="row-actions">
                        <button onClick={() => add('decision', d)}>Edit</button>
                        <button onClick={() => remove('decisions', d.id, d.title)}>Hapus</button>
                      </div>
                    </article>
                  ))}
                {!state.decisions.length && (
                  <Empty title="Simpan alasan di balik langkahmu.">
                    <p>Catat keputusan, eksperimen, dan sumber persetujuannya.</p>
                  </Empty>
                )}
              </section>
              <section className="card">
                <div className="card-head">
                  <h2>Fondasi dari dokumen sumber</h2>
                  <a className="text-link" href="#docs">
                    Lihat sumber <Icon.ArrowUpRight />
                  </a>
                </div>
                {foundations
                  .filter(
                    ([title, source]) =>
                      (!filter || filter === 'FINAL') &&
                      (title + ' ' + source).toLowerCase().includes(search.toLowerCase()),
                  )
                  .map(([title, source]) => (
                    <article className="record" key={title}>
                      <div>
                        <h3>{title}</h3>
                        <p>{source}</p>
                      </div>
                      <Badge>FINAL</Badge>
                    </article>
                  ))}
                <p className="card-note">
                  Fondasi baca-saja. Seluruh usulan dan riwayat keputusan tetap tersedia dalam 18
                  dokumen sumber.
                </p>
              </section>
            </>
          )}
          {page === 'tools' && (
            <>
              <section className="card">
                <div className="card-head">
                  <h2>Inventaris milikmu</h2>
                  <span className="count">{state.assets.length} aset dicatat</span>
                </div>
                {state.assets.length ? (
                  state.assets.map((a) => (
                    <article className="record" key={a.id}>
                      <div>
                        <Badge>{a.status}</Badge>
                        <h3>{a.title}</h3>
                        <p>{a.location || 'Lokasi belum dicatat'}</p>
                        {a.notes && <p>{a.notes}</p>}
                      </div>
                      <div className="row-actions">
                        <button onClick={() => add('asset', a)}>Edit</button>
                        <button onClick={() => remove('assets', a.id, a.title)}>Hapus</button>
                      </div>
                    </article>
                  ))
                ) : (
                  <Empty title="Mulai dari yang benar-benar dipakai.">
                    <p>
                      Catat lokasi aset dan pengelolaan akses. Simpan kata sandi dan API key di
                      pengelola rahasia.
                    </p>
                  </Empty>
                )}
              </section>
              <section className="card">
                <div className="card-head">
                  <h2>Status referensi sumber</h2>
                  <a className="text-link" href="#docs">
                    Inventaris asli <Icon.ArrowUpRight />
                  </a>
                </div>
                {referenceAssets.map(([title, status, note]) => (
                  <article className="record" key={title}>
                    <div>
                      <h3>{title}</h3>
                      <p>{note}</p>
                    </div>
                    <Badge>{status}</Badge>
                  </article>
                ))}
              </section>
            </>
          )}
          {page === 'data' && (
            <div className="data-layout">
              <section className="card">
                <div className="card-head">
                  <h2>Cadangan yang bisa dibawa</h2>
                  <Icon.Download size={20} />
                </div>
                <p>
                  Ekspor seluruh prospek, transaksi, roadmap, keputusan, dan inventaris milik
                  akunmu. Dokumen bisnis dapat diunduh satu per satu dari Pustaka HQ.
                </p>
                <div className="data-count">
                  <strong className="reading">{dataRecords}</strong>
                  <span>catatan operasional · revisi {snapshot.revision}</span>
                </div>
                <button className="primary" onClick={exportData} disabled={busy}>
                  <Icon.Download />
                  Ekspor data JSON
                </button>
                <p className="card-note">
                  File JSON berisi data bisnis pribadi. Cadangan manual bukan backup otomatis.
                </p>
              </section>
              <section className="card">
                <div className="card-head">
                  <h2>Pindahkan data ke HQ</h2>
                  <Icon.Upload size={20} />
                </div>
                <p>Mendukung ekspor JSON aplikasi lama (v1) dan HQ baru (v2). Maksimal 2 MB.</p>
                <label className="file-label">
                  Pilih cadangan JSON
                  <input
                    type="file"
                    accept="application/json,.json"
                    disabled={busy}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      setPreview(null);
                      setRaw('');
                      setConfirmation('');
                      setError('');
                      if (!file) return;
                      if (file.size > 2_000_000) {
                        setError('File melebihi 2 MB.');
                        return;
                      }
                      try {
                        setRaw(await file.text());
                        setFileName(file.name);
                      } catch {
                        setError('File tidak dapat dibaca.');
                      }
                    }}
                  />
                </label>
                <label>
                  Cara impor
                  <select
                    value={mode}
                    onChange={(e) => {
                      setMode(e.target.value as 'merge' | 'replace');
                      setPreview(null);
                      setConfirmation('');
                      setBackup(false);
                    }}
                  >
                    <option value="merge">Gabung · pertahankan data sekarang</option>
                    <option value="replace">Ganti seluruh data operasional</option>
                  </select>
                </label>
                <p className="card-note">
                  Gabung memakai ID sebagai identitas. ID yang sama mempertahankan data saat ini,
                  termasuk jika isi berbeda. Isi identik dengan ID berbeda dianggap catatan
                  terpisah.
                </p>
                <button
                  className="secondary"
                  disabled={!raw || busy}
                  onClick={() =>
                    run(
                      () => actions.previewImport({ raw, mode }),
                      (p) => {
                        setPreview(p);
                        setConfirmation('');
                        setBackup(false);
                      },
                    )
                  }
                >
                  Pratinjau {fileName && 'cadangan'}
                </button>
                {preview && (
                  <div className="import-preview">
                    <h3>Pratinjau sebelum menyimpan</h3>
                    <p>
                      {mode === 'replace'
                        ? 'Seluruh data operasional akan diganti, termasuk roadmap dan inventaris.'
                        : 'Catatan baru ditambahkan; data dengan ID sama tidak ditimpa. Penanda roadmap digabung, tanggal mulai saat ini dipertahankan.'}
                    </p>
                    <div className="table-wrap">
                      <table className="compact">
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Masuk</th>
                            <th>ID sama</th>
                            <th>Berbeda isi</th>
                            <th>Baru</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(preview.counts).map(([k, v]) => (
                            <tr key={k}>
                              <td>
                                {
                                  {
                                    leads: 'Prospek',
                                    entries: 'Transaksi',
                                    decisions: 'Keputusan',
                                    assets: 'Aset',
                                  }[k]
                                }
                              </td>
                              <td className="mono">{v.incoming}</td>
                              <td className="mono">{v.duplicates}</td>
                              <td className="mono">{v.conflicts}</td>
                              <td className="mono">{v.added}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {mode === 'replace' && (
                      <label className="check-label">
                        <input
                          type="checkbox"
                          checked={backup}
                          onChange={(e) => setBackup(e.target.checked)}
                        />{' '}
                        Saya sudah menyimpan cadangan data saat ini.
                      </label>
                    )}
                    <label>
                      Ketik IMPOR untuk mengonfirmasi
                      <input
                        value={confirmation}
                        onChange={(e) => setConfirmation(e.target.value)}
                        autoComplete="off"
                      />
                    </label>
                    <button
                      className="primary"
                      disabled={busy || confirmation !== 'IMPOR' || (mode === 'replace' && !backup)}
                      onClick={() =>
                        run(
                          () =>
                            actions.commitImport({
                              raw,
                              mode,
                              revision: preview.revision,
                              digest: preview.digest,
                              confirmation,
                            }),
                          (data) => {
                            setSnapshot(data);
                            setPreview(null);
                            setRaw('');
                            setConfirmation('');
                            setNotice('Impor selesai. Data tersimpan secara atomik di akunmu.');
                          },
                        )
                      }
                    >
                      <Icon.Check />
                      Konfirmasi impor
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}
          <footer className="app-footer">
            <span>Somesea HQ · Pelan, tapi terarah.</span>
            <span className="sync">
              Tersimpan di akunmu · revisi {snapshot.revision}
              <button onClick={reload} disabled={busy} aria-label="Muat ulang data">
                <Icon.Sync size={16} />
                Muat ulang
              </button>
            </span>
          </footer>
        </div>
      </main>
      <nav className="tabbar" aria-label="Navigasi utama">
        {tabs.map((n) => (
          <a
            href={'#' + n.id}
            key={n.id}
            aria-label={n.title}
            aria-current={page === n.id ? 'page' : undefined}
          >
            <n.icon size={20} />
            {n.short}
          </a>
        ))}
        <button
          aria-expanded={sheet}
          aria-controls="more-sheet"
          className={more.some((n) => n.id === page) ? 'current' : ''}
          onClick={() => setSheet(!sheet)}
        >
          <Icon.Menu size={20} />
          Lainnya
        </button>
        {sheet && (
          <>
            <button
              className="sheet-backdrop"
              aria-label="Tutup menu"
              onClick={() => setSheet(false)}
            />
            <div id="more-sheet" className="sheet">
              {more.map((n) => (
                <a href={'#' + n.id} key={n.id} aria-current={page === n.id ? 'page' : undefined}>
                  <n.icon />
                  {n.title}
                </a>
              ))}
              <button onClick={signOut} disabled={busy} title={'Keluar dari ' + email}>
                <Icon.SignOut />
                Keluar
              </button>
            </div>
          </>
        )}
      </nav>
      <dialog
        ref={dialog}
        onCancel={(e) => {
          if (busy) e.preventDefault();
          else setEditor(null);
        }}
        onClose={() => setEditor(null)}
        aria-labelledby="editor-title"
      >
        <div className="dialog-header">
          <h2 id="editor-title">
            {editor?.kind === 'delete'
              ? 'Hapus catatan?'
              : (editor && 'value' in editor && editor.value ? 'Edit ' : 'Tambah ') +
                ({ lead: 'prospek', entry: 'transaksi', decision: 'keputusan', asset: 'aset' }[
                  editor?.kind ?? 'lead'
                ] ?? 'catatan')}
          </h2>
          <button
            className="icon-button"
            aria-label="Tutup formulir"
            disabled={busy}
            onClick={() => setEditor(null)}
          >
            <Icon.Close size={20} />
          </button>
        </div>
        <form onSubmit={submitEditor}>
          {editor?.kind === 'delete' ? (
            <p>
              Hapus “{editor.title}” dari akunmu? Ekspor cadangan jika catatan masih perlu disimpan.
            </p>
          ) : (
            <div className="form-grid">
              {editor?.kind === 'lead' && (
                <>
                  {field('name', 'Nama / usaha')}
                  {field('problem', 'Kebutuhan atau masalah')}
                  {select('stage', 'Tahap', stages)}
                  {field(
                    'value',
                    'Nilai estimasi (Rp), 0 jika belum diketahui',
                    'number',
                    true,
                    Number(editor.value?.value ?? 0),
                  )}
                  {field('next', 'Tindakan berikutnya', 'text', false)}
                  {field('date', 'Tanggal tindak lanjut', 'date', false)}
                </>
              )}
              {editor?.kind === 'entry' && (
                <>
                  {field('title', 'Uraian / proyek')}
                  {select('type', 'Jenis catatan', kinds)}
                  {field('value', 'Nilai (Rp)', 'number')}
                  {field('date', 'Tanggal', 'date', true, String(editor.value?.date ?? today()))}
                  <p className="card-note">
                    Omzet dan pembayaran dicatat terpisah. Jangan hitung DP sebagai omzet tambahan.
                  </p>
                </>
              )}
              {editor?.kind === 'decision' && (
                <>
                  {field('title', 'Keputusan / ide')}
                  {select('status', 'Status', statuses, 'USULAN')}
                  {field('source', 'Sumber persetujuan atau alasan')}
                </>
              )}
              {editor?.kind === 'asset' && (
                <>
                  {field('title', 'Nama tool / aset')}
                  {select(
                    'status',
                    'Status',
                    ['TERSEDIA', 'USULAN', 'BELUM TERVERIFIKASI'],
                    'BELUM TERVERIFIKASI',
                  )}
                  {field('location', 'Lokasi aset / pengelolaan akses', 'text', false)}
                  <label>
                    Catatan
                    <textarea
                      name="notes"
                      maxLength={2000}
                      defaultValue={String(editor.value?.notes ?? '')}
                    />
                  </label>
                  <p className="card-note">
                    Catat lokasi pengelolaan akses. Jangan simpan kata sandi atau API key.
                  </p>
                </>
              )}
            </div>
          )}
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <button
              type="button"
              className="secondary"
              disabled={busy}
              onClick={() => setEditor(null)}
            >
              Batal
            </button>
            <button className={editor?.kind === 'delete' ? 'danger' : 'primary'} disabled={busy}>
              {busy
                ? 'Menyimpan…'
                : editor?.kind === 'delete'
                  ? 'Hapus catatan'
                  : 'Simpan perubahan'}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
