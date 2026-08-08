export default function AvatarUpload({ image, letter, onChange, onBlur, inputId = 'avatar-upload' }) {
  return (
    <div className="mb-6 flex justify-center">
      <div className="relative">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-teal-400/40 via-white/10 to-amber-300/30 p-[2px]">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04] text-xl font-semibold text-teal-300">
            {image ? (
              <img src={image} alt="Avatar preview" className="h-full w-full object-cover" />
            ) : (
              <span>{letter}</span>
            )}
          </div>
        </div>
        <input
          type="file"
          id={inputId}
          className="hidden"
          accept="image/*"
          onChange={onChange}
          onBlur={onBlur}
        />
        <label
          htmlFor={inputId}
          className="absolute -bottom-0.5 -right-0.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-[#0b0e13] shadow-lg transition-transform duration-150 hover:scale-110 active:scale-95"
        >
          <i className="fas fa-plus text-xs" />
        </label>
      </div>
    </div>
  );
}
