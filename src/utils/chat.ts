export const CHAT_MAX_LENGTH = 200;

function stripControlChars(value: string): string {
  let out = "";
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    if (code >= 32 || code === 10) out += ch;
  }
  return out;
}

export function sanitizeChatText(raw: string): string {
  return stripControlChars(raw)
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, CHAT_MAX_LENGTH);
}
