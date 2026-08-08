export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required,
  options,
  className = '',
}) {
  const isSelect = type === 'select';

  const fieldBase = `peer w-full rounded-xl border bg-white/[0.04] px-4 text-[15px] text-slate-100 outline-none transition-all duration-200 ${
    isSelect ? 'appearance-none cursor-pointer py-3.5' : 'py-3.5 placeholder-transparent'
  } ${
    error
      ? 'border-rose-400/60 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20'
      : 'border-white/10 hover:border-white/20 focus:border-teal-400/70 focus:ring-2 focus:ring-teal-400/20'
  }`;

  return (
    <div className={`mb-4 ${className}`}>
      {isSelect && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-slate-400">
          {label}
        </label>
      )}

      <div className="relative">
        {isSelect ? (
          <>
            <select id={id} value={value} onChange={onChange} onBlur={onBlur} className={fieldBase}>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.value === ''} className="bg-[#0b0e13]">
                  {opt.label}
                </option>
              ))}
            </select>
            <i className="fas fa-chevron-down pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500" />
          </>
        ) : (
          <>
            <input
              id={id}
              type={type}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              placeholder=" "
              required={required}
              aria-invalid={Boolean(error)}
              className={fieldBase}
            />
            <label
              htmlFor={id}
              className="pointer-events-none absolute left-4 top-3.5 text-[15px] text-slate-500 transition-all duration-150 peer-focus:-top-2.5 peer-focus:bg-[#0d1119] peer-focus:px-1.5 peer-focus:text-xs peer-focus:text-teal-300 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:bg-[#0d1119] peer-[:not(:placeholder-shown)]:px-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-slate-400"
            >
              {label}
            </label>
          </>
        )}
      </div>

      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-400">
          <i className="fas fa-circle-exclamation" />
          {error}
        </p>
      )}
    </div>
  );
}
