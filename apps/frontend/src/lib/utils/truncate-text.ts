export const truncateText = (text?: string | null, maxLength: number = 50) => {
  if (!text) return ""; // handle undefined/null/empty string
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};