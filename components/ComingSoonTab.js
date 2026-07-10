export default function ComingSoonTab({ title, note }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-deep to-gold/60" />
      <h2 className="font-bengali mb-1.5 text-lg font-semibold text-ink-100">{title}</h2>
      <p className="font-bengali text-sm text-ink-500">{note}</p>
    </div>
  );
}
