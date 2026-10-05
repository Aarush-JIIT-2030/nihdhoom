export const MAX_EVIDENCE_BYTES = 12 * 1024 * 1024;
export const ACCEPTED_EVIDENCE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function validateEvidenceFile(file: File | Blob, name = 'evidence'): Promise<string | null> {
  if (!(file instanceof Blob)) return 'Evidence file is invalid.';
  if (file.size <= 0) return 'Evidence file is empty.';
  if (file.size > MAX_EVIDENCE_BYTES) return 'Evidence must be 12 MB or smaller.';

  const type = file.type.toLowerCase();
  if (!ACCEPTED_EVIDENCE_TYPES.has(type)) {
    return 'Only JPEG, PNG or WebP field photos are accepted.';
  }

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  const isPng = header.length >= 8 &&
    header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47 &&
    header[4] === 0x0d && header[5] === 0x0a && header[6] === 0x1a && header[7] === 0x0a;
  const isWebp = header.length >= 12 &&
    header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
    header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50;

  if (!(isJpeg || isPng || isWebp)) return `${name} is not a valid image file.`;
  return null;
}
