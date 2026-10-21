'use client';
import { useState } from 'react';
import { authenticate } from '@/app/actions';
import { Compass } from '@/components/icons';
export default function Login({ configured }: { configured: boolean }) {
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  return (
    <main id="main" className="login-shell">
      <section className="login-story">
        <a className="brand" href="/">
          <Compass />
          <span>
            <span className="brand-name">somesea</span>
            <span className="brand-sub">HQ · RUANG KERJA</span>
          </span>
        </a>
        <div>
          <p className="eyebrow">RUANG KERJA PERSONAL / SAMS</p>
          <h1>
            Ide punya tempat.
            <br />
            Bisnis punya arah.
          </h1>
          <p>
            Satu ruang untuk menjaga relasi, menata pekerjaan, dan merawat bisnis yang tumbuh
            bersamamu.
          </p>
        </div>
        <p className="signature">
          @somesea__ <span>Pelan, tapi terarah.</span>
        </p>
      </section>
      <section className="login-form">
        <p className="eyebrow">SELAMAT DATANG KEMBALI</p>
        <h2>Masuk ke ruangmu.</h2>
        <p>Catatan bisnis tersimpan di akunmu, siap dibuka lintas perangkat.</p>
        {!configured ? (
          <div role="status" className="notice">
            <strong>Ruang kerja menunggu koneksi Supabase.</strong>
            <p>
              Isi konfigurasi environment dan jalankan migrasi sesuai panduan setup. Data bisnis
              belum dimuat.
            </p>
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError('');
              try {
                const values = Object.fromEntries(new FormData(e.currentTarget));
                const result = await authenticate(values);
                if (result.ok) window.location.assign('/');
                else setError(result.error);
              } catch {
                setError('Koneksi gagal. Coba kembali.');
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Email
              <input name="email" type="email" autoComplete="username" required maxLength={254} />
            </label>
            <label>
              Kata sandi
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={1}
                maxLength={128}
              />
            </label>
            {error && (
              <p role="alert" className="error-text">
                {error}
              </p>
            )}
            <button className="primary" disabled={busy}>
              {busy ? 'Memeriksa akun…' : 'Masuk ke HQ →'}
            </button>
            <p className="small">
              Gunakan akun yang dibuat oleh pemilik proyek Supabase. Untuk pemulihan akses, hubungi
              pengelola akun.
            </p>
          </form>
        )}
        <div className="login-foot">Personal, dekat, dan terus bertumbuh.</div>
      </section>
    </main>
  );
}
