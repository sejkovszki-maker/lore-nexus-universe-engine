import process from 'node:process';
const MAX_INPUT_BYTES = 25 * 1024 * 1024; let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; if (input.length > Math.ceil(MAX_INPUT_BYTES * 4 / 3) + 10_000) { console.error('SANDBOX_INPUT_TOO_LARGE'); process.exit(2); } });
process.stdin.on('end', () => {
  try {
    const request = JSON.parse(input); const bytes = Buffer.from(request.base64, 'base64');
    if (bytes.length > MAX_INPUT_BYTES) throw new Error('SANDBOX_INPUT_TOO_LARGE');
    let text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    if (request.mediaType === 'text/html' || request.mediaType === 'application/oebps-package+xml') text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    process.stdout.write(JSON.stringify({ processorId: 'sandbox.text', processorVersion: '1.0.0', pages: [{ pageNumber: 1, text, method: 'native' }], metadata: { sandboxed: true } }));
  } catch (error) { console.error(error.message); process.exit(1); }
});
