export default function TabHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald/20 to-gold/20 text-gold-soft">
        <Icon size={18} />
      </span>
      <div>
        <h1 className="font-display text-[19px] font-semibold italic leading-tight text-ink-100">{title}</h1>
        {subtitle && <p className="font-bengali text-[11px] leading-tight text-ink-500">{subtitle}</p>}
      </div>
    </div>
  );
}
