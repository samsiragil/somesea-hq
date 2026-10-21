'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem('somesea-theme');
      } catch {
        /* Storage may be disabled. */
      }
      const next = saved === 'dark' || (saved !== 'light' && media.matches);
      document.documentElement.dataset.theme = next ? 'dark' : 'light';
      setDark(next);
    };
    sync();
    media.addEventListener('change', sync);
    window.addEventListener('storage', sync);
    return () => {
      media.removeEventListener('change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return (
    <button
      className="secondary theme-toggle"
      role="switch"
      aria-label="Tema gelap"
      aria-checked={dark}
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.dataset.theme = next ? 'dark' : 'light';
        try {
          localStorage.setItem('somesea-theme', next ? 'dark' : 'light');
        } catch {
          /* Still works for this visit. */
        }
      }}
    >
      <span aria-hidden="true">{dark ? '◐' : '◑'}</span> {dark ? 'Dark' : 'Light'}
    </button>
  );
}
