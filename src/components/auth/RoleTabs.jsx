export default function RoleTabs({ roles, activeKey, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Select account type"
      className="mb-5 flex gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1"
    >
      {roles.map((r) => (
        <button
          key={r.key}
          type="button"
          role="tab"
          aria-selected={r.key === activeKey}
          onClick={() => onChange(r.key)}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full py-2 text-[11px] font-semibold transition-all duration-150 sm:text-xs ${
            r.key === activeKey
              ? 'bg-teal-400 text-[#0b0e13] shadow-[0_4px_14px_-4px_rgba(45,214,192,0.6)]'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <i className={`fas ${r.icon} text-[10px]`} />
          {r.label}
        </button>
      ))}
    </div>
  );
}
