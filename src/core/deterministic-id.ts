function canonicalPart(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('en-US').replace(/\s+/g, ' ');
}

function bytesToHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function deterministicEntityId(universeId: string, entityType: string, identityKey: string): Promise<string> {
  if (!universeId || !entityType || !identityKey) throw new Error('Deterministic ID inputs must be non-empty');
  const canonical = [universeId, entityType, identityKey].map(canonicalPart).join('\u001f');
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  return `ent_${bytesToHex(digest).slice(0, 40)}`;
}

export async function deterministicUniverseId(slug: string): Promise<string> {
  const canonical = canonicalPart(slug);
  if (!canonical) throw new Error('Universe slug must be non-empty');
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(`universe\u001f${canonical}`));
  return `uni_${bytesToHex(digest).slice(0, 32)}`;
}
