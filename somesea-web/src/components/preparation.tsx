'use client';
import { useState } from 'react';
import type { Mutation, State } from '@/lib/model';

const steps = [
  {
    id: 'prep-capacity',
    title: 'Kenali ritmemu',
    time: '20–30 menit',
    why: 'Rencana akan lebih mudah dijalankan kalau sesuai energi dan waktu luangmu. Kita perlu tahu ruang yang benar-benar tersedia sebelum menambah pekerjaan.',
    actions: [
      'Lihat jadwal satu minggu: pekerjaan utama, istirahat, dan urusan pribadi.',
      'Pilih dua atau tiga slot kecil yang benar-benar bisa dipakai untuk Somesea.',
      'Tentukan versi paling ringan saat sedang lelah, misalnya merapikan satu catatan selama 15 menit.',
    ],
    example:
      'Contoh, bukan target wajib: Selasa dan Kamis 30 menit, Sabtu 60 menit. Kalau lelah, cukup review 15 menit. Minggu untuk istirahat.',
    done: 'Ada jadwal yang masuk akal, batas waktu per sesi, dan rencana saat energimu turun.',
    prompt: 'Kapan kamu punya waktu, berapa lama, dan apa batasnya?',
    link: '#decisions',
    linkLabel: 'Lihat catatan keputusan',
  },
  {
    id: 'prep-direction',
    title: 'Pilih satu arah belajar',
    time: '30 menit',
    why: 'Arah jasa digital AI-assisted sudah ada. Yang perlu dipilih sekarang adalah satu jenis pekerjaan untuk dilatih agar perhatianmu tidak terbagi.',
    actions: [
      'Pilih yang paling dekat dengan pengalamanmu: website sederhana, alat pencatatan internal, atau perbaikan satu proses manual.',
      'Tulis satu masalah kecil yang ingin kamu bantu selesaikan dan siapa yang mengalaminya.',
      'Batasi hasil latihan: satu halaman atau satu alur saja. Catat bagian yang belum kamu kuasai.',
    ],
    example:
      'Aku ingin berlatih membuat pencatatan pesanan untuk usaha kecil. Cukup tambah pesanan, ubah status, dan lihat daftar. Pembayaran dan integrasi chat ditunda.',
    done: 'Bisa menjelaskan satu masalah, satu hasil latihan, dan hal yang sengaja ditunda.',
    prompt: 'Apa fokus latihanmu dan apa yang tidak masuk lingkupnya?',
    link: '#docs',
    linkLabel: 'Buka pustaka strategi',
  },
  {
    id: 'prep-assets',
    title: 'Periksa bekal yang tersedia',
    time: '30–45 menit',
    why: 'Dokumen rencana sudah tersedia, tetapi tools dan Business OS lama belum terverifikasi. Memeriksa akses dan berkas mencegah kita merencanakan sesuatu dari aset yang belum jelas.',
    actions: [
      'Buka folder kerja dan akun tool yang akan dipakai untuk latihan.',
      'Catat nama, lokasi, bisa diakses atau belum, serta biaya yang kamu ketahui di Tools & aset.',
      'Pilih tools yang sudah cukup untuk latihan. Jika file lama tidak ditemukan, tandai belum terverifikasi dan lanjutkan dengan bekal yang ada.',
    ],
    example:
      'Editor bisa dibuka; folder latihan sudah dibuat; biaya hosting belum diperiksa; Business OS lama belum ditemukan. Latihan pertama cukup berjalan lokal.',
    done: 'Tahu alat yang bisa dipakai sekarang, lokasi berkas, dan apa yang masih perlu dicek.',
    prompt: 'Apa yang tersedia, apa yang belum jelas, dan apa tindak lanjutnya?',
    link: '#tools',
    linkLabel: 'Catat di Tools & aset',
  },
  {
    id: 'prep-practice',
    title: 'Coba satu latihan kecil',
    time: '2–3 sesi pendek',
    why: 'Latihan memberi gambaran kemampuan dan hambatan nyata. Hasilnya membantu menyesuaikan rencana tanpa tekanan mencari klien.',
    actions: [
      'Pakai data contoh dan kerjakan satu alur dari awal sampai bisa dicoba.',
      'Catat waktu aktual, bagian yang membingungkan, dan bantuan yang kamu perlukan.',
      'Coba sendiri hasilnya, lalu tulis: apa yang sudah berjalan, apa yang perlu diulang, dan satu perbaikan untuk sesi berikutnya.',
    ],
    example:
      'Latihan daftar pesanan: tambah satu pesanan contoh, ubah status, lalu cek hasilnya. Selesai dalam tiga sesi; penyimpanan masih perlu dipelajari. Berikutnya ulangi bagian itu.',
    done: 'Ada hasil yang bisa dicoba, catatan waktu, dan satu pelajaran untuk langkah berikutnya. Hasil belum harus sempurna.',
    prompt: 'Apa hasil latihan, waktu aktual, hambatan, dan langkah kecil berikutnya?',
    link: '#decisions',
    linkLabel: 'Buka catatan evaluasi',
  },
];

export default function Preparation({
  state,
  busy,
  persist,
}: {
  state: State;
  busy: boolean;
  persist: (input: Mutation) => Promise<void>;
}) {
  const records = steps.map((step) => state.decisions.find((d) => d.id === step.id));
  const completed = records.filter((d) => d?.status === 'FINAL').length;
  const next = records.findIndex((d) => d?.status !== 'FINAL');
  const [selected, setSelected] = useState(Math.max(0, next));
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const step = steps[selected];
  const record = records[selected];
  const note = drafts[step.id] ?? record?.source ?? '';
  const dirty = note !== (record?.source ?? '');
  function save(complete: boolean) {
    void persist({
      kind: 'decision',
      value: {
        id: step.id,
        title: 'Penyesuaian awal · ' + step.title,
        status: complete ? 'FINAL' : 'EKSPERIMEN',
        source: note.trim(),
      },
    });
  }
  return (
    <>
      <section className="prep-overview" aria-labelledby="prep-heading">
        <div>
          <p className="label">Pijakan sebelum melangkah</p>
          <h2 id="prep-heading">Sekarang, cukup menyiapkan diri.</h2>
          <p>
            Urutannya: kenali waktu → pilih fokus → cek bekal → coba latihan. Ukur kemajuan dari
            kejelasan dan hasil kecil yang kamu buat.
          </p>
          <p className="prep-context">
            Target Rp5 juta/bulan tetap menjadi arah jangka panjang. Untuk fase ini, kamu belum
            perlu mencari prospek, menetapkan harga, atau mengirim proposal.
          </p>
        </div>
        <div className="prep-progress">
          <strong>
            {completed}
            <span> / 4</span>
          </strong>
          <p>langkah kamu tandai selesai</p>
          <progress aria-label="Kemajuan penyesuaian awal" value={completed} max={4} />
          <small>Berdasarkan catatanmu, bukan penilaian otomatis.</small>
        </div>
      </section>
      <div className="prep-next">
        <div>
          <p className="label">{next < 0 ? 'Waktunya meninjau' : 'Saran sesi berikutnya'}</p>
          <h2>{next < 0 ? 'Baca kembali hasil empat langkahmu.' : steps[next].title}</h2>
          <p>
            {next < 0
              ? 'Tentukan apakah perlu mengulang latihan atau mulai mempelajari kebutuhan calon pengguna. Selesai persiapan tidak otomatis berarti siap menjual.'
              : `Sisihkan ${steps[next].time.toLowerCase()}. Kalau terasa berat, pecah menjadi sesi yang lebih pendek.`}
          </p>
        </div>
        {next >= 0 && (
          <button
            className="primary"
            onClick={() => {
              setSelected(next);
              document
                .getElementById('prep-detail')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            Buka langkah ini
          </button>
        )}
      </div>
      <section className="prep-workbench" aria-label="Panduan penyesuaian awal">
        <nav className="prep-steps" aria-label="Langkah persiapan">
          {steps.map((s, i) => (
            <button
              key={s.id}
              aria-current={i === selected ? 'step' : undefined}
              aria-controls="prep-detail"
              onClick={() => setSelected(i)}
            >
              <span className="prep-number">0{i + 1}</span>
              <span>
                <strong>{s.title}</strong>
                <small>
                  {records[i]?.status === 'FINAL'
                    ? 'Selesai'
                    : records[i]
                      ? 'Sedang dicoba'
                      : 'Belum dicatat'}{' '}
                  · {s.time}
                </small>
              </span>
            </button>
          ))}
        </nav>
        <article id="prep-detail" className="card prep-detail">
          <p className="label">
            Langkah {selected + 1} · Durasi usulan {step.time}
          </p>
          <h2>{step.title}</h2>
          <p>{step.why}</p>
          <h3>Yang kamu kerjakan</h3>
          <ol>
            {step.actions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ol>
          <details key={step.id}>
            <summary>Lihat contoh hasil yang cukup</summary>
            <p>{step.example}</p>
          </details>
          <div className="prep-criteria">
            <h3>Kapan dianggap cukup?</h3>
            <p>{step.done}</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save(false);
            }}
          >
            <label htmlFor="prep-note">Catatanmu · {step.prompt}</label>
            <textarea
              id="prep-note"
              required
              maxLength={500}
              rows={4}
              value={note}
              onChange={(e) => setDrafts({ ...drafts, [step.id]: e.target.value })}
              placeholder="Tulis hasilmu sendiri. Contoh di atas hanya panduan."
            />
            <small aria-live="polite">
              {note.length}/500 ·{' '}
              {dirty
                ? 'Ada perubahan belum disimpan'
                : record
                  ? 'Catatan tersimpan di akun'
                  : 'Belum ada catatan tersimpan'}
            </small>
            <div className="prep-actions">
              <button className="secondary" type="submit" disabled={busy || !note.trim()}>
                Simpan sebagai proses
              </button>
              <button
                className="primary"
                type="button"
                disabled={busy || !note.trim()}
                onClick={() => save(true)}
              >
                {record?.status === 'FINAL' ? 'Simpan hasil selesai' : 'Simpan & tandai selesai'}
              </button>
            </div>
            <p className="footnote">
              Catatan masuk ke Decision log dan cadangan JSON. Untuk membuka kembali langkah yang
              selesai, pilih “Simpan sebagai proses”.
            </p>
          </form>
          <a className="text-link" href={step.link}>
            {step.linkLabel} →
          </a>
        </article>
      </section>
      <section className="card prep-review">
        <h2>Tutup sesi dengan tiga pertanyaan</h2>
        <p>
          Apa yang sudah lebih jelas? Apa yang masih menghambat? Apa satu hal kecil yang akan
          kukerjakan berikutnya?
        </p>
        <p>
          Urutan ini adalah usulan kerja berdasarkan arahanmu untuk fokus pada penyesuaian awal dan
          dokumen strategi yang ada. Kamu boleh mengulang langkah atau mengubah ritme. Roadmap 90
          hari di menu adalah referensi untuk tahap setelah ini.
        </p>
      </section>
    </>
  );
}
