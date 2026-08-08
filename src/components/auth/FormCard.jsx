export default function FormCard({ title, subtitle, children, footer }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-8">
      <div className="mb-6 text-center sm:mb-7">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-white sm:text-[1.75rem]">
          {title}
        </h2>
        {subtitle && <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p>}
      </div>

      {children}

      {footer && <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>}
    </div>
  );
}
