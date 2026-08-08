// Font stacks for the auth design system.
// Deliberately using system/web-safe font stacks (no next/font/google fetch)
// so production builds never depend on network access to Google Fonts.

// Display stack — an editorial serif for headings, carries the trust/premium tone.
export const displayFontStack =
  "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif";

// Body/UI stack — a clean, modern sans for labels, inputs, buttons, copy.
export const bodyFontStack =
  "'Inter', 'Segoe UI', ui-sans-serif, system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif";
