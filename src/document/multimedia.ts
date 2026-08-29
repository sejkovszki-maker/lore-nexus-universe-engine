import type { MultimediaDescriptor } from './processing.ts';
function ascii(bytes: Uint8Array, start: number, length: number): string { return new TextDecoder('ascii').decode(bytes.slice(start, start + length)); }
function uint32be(bytes: Uint8Array, offset: number): number { return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, false); }
export function inspectMultimedia(bytes: Uint8Array, mediaType: string): MultimediaDescriptor {
  if (mediaType === 'image/png') { if (bytes.length < 24 || ascii(bytes, 1, 3) !== 'PNG') throw new Error('Invalid PNG'); return { mediaType, width: uint32be(bytes, 16), height: uint32be(bytes, 20) }; }
  if (mediaType === 'image/jpeg') return { mediaType };
  if (mediaType === 'audio/wav') {
    if (bytes.length < 44 || ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'WAVE') throw new Error('Invalid WAV');
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength); const channels = view.getUint16(22, true); const sampleRate = view.getUint32(24, true); const byteRate = view.getUint32(28, true); const dataBytes = view.getUint32(40, true);
    return { mediaType, channels, sampleRate, durationMs: byteRate ? Math.round(dataBytes / byteRate * 1000) : undefined };
  }
  if (mediaType.startsWith('audio/') || mediaType.startsWith('video/')) return { mediaType };
  throw new Error(`Unsupported multimedia type: ${mediaType}`);
}
