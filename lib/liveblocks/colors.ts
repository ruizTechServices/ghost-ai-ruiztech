const CURSOR_COLOR_PALETTE = [
  "#F97066",
  "#F79009",
  "#EAAA08",
  "#84CC16",
  "#22C55E",
  "#06B6D4",
  "#3B82F6",
  "#6366F1",
  "#A855F7",
  "#EC4899",
] as const;

const getCursorColorForUser = (userId: string): string => {
  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) | 0;
  }

  const paletteIndex = Math.abs(hash) % CURSOR_COLOR_PALETTE.length;
  return CURSOR_COLOR_PALETTE[paletteIndex];
};

export { CURSOR_COLOR_PALETTE, getCursorColorForUser };
