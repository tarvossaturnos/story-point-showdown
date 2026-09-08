// 32 characters: no easily confused 0/O or 1/I. Masking is unbiased for 32 symbols.
export const PIN_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function generateRoomPin(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(5)), byte => PIN_ALPHABET[byte & 31]).join('');
}
export function parseRoomId(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^[A-HJ-NP-Z2-9]{5}$/i.test(trimmed)) return trimmed.toUpperCase();
  // Keep previously shared room links working.
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(trimmed)) return trimmed.toLowerCase();
  return null;
}
