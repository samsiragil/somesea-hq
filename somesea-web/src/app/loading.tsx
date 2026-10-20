export default function Loading() {
  return (
    <main id="main" className="fallback" aria-busy="true">
      <p className="eyebrow">SOMESEA HQ</p>
      <h1>Menyiapkan ruangmu…</h1>
      <div className="skeleton" />
      <div className="skeleton" />
    </main>
  );
}
