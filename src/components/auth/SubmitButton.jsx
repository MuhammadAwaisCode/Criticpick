export default function SubmitButton({ children, loading, disabled, loadingText, id }) {
  return (
    <button
      type="submit"
      id={id}
      disabled={disabled || loading}
      className="group relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 px-4 py-3.5 text-[15px] font-semibold text-[#0b0e13] shadow-[0_8px_24px_-8px_rgba(45,214,192,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-10px_rgba(45,214,192,0.65)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_24px_-8px_rgba(45,214,192,0.5)]"
    >
      {loading && <i className="fas fa-circle-notch fa-spin" />}
      {loading ? loadingText || 'Please wait…' : children}
      {!loading && (
        <i className="fas fa-arrow-right text-xs opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
      )}
    </button>
  );
}
