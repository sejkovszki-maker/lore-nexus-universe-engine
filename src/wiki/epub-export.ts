export interface EpubChapter {
  id: string;
  title: string;
  content: string;
}

export interface EpubBook {
  id: string;
  title: string;
  language?: string;
  chapters: EpubChapter[];
}

const xmlEscape = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const safeId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/gu, '-').replace(/-+/gu, '-').replace(/^-|-$/gu, '') || 'book';

function safeChapterMarkup(value: string) {
  return value
    .replace(/<(?:script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\/(?:script|style|iframe|object|embed|form)>/giu, '')
    .replace(/\s(?:on\w+|style)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/giu, '')
    .replace(/\s(?:src|href)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*')/giu, '')
    .replace(/<(br|hr|img)([^>]*?)(?<!\/)\s*>/giu, '<$1$2 />');
}

export function epubFileName(title: string) {
  const normalized = title.normalize('NFKD').replace(/[\u0300-\u036f]/gu, '').replace(/[^a-zA-Z0-9]+/gu, '-').replace(/^-|-$/gu, '').toLocaleLowerCase('hu-HU');
  return `${normalized || 'lore-nexus-konyv'}.epub`;
}

export async function createEpub(book: EpubBook): Promise<Blob> {
  if (!book.title.trim() || !book.chapters.length) throw new Error('EPUB_EMPTY_BOOK');
  if (book.chapters.some(chapter => !chapter.id.trim() || !chapter.title.trim() || !chapter.content.trim())) throw new Error('EPUB_INVALID_CHAPTER');
  const { strToU8, zipSync } = await import('fflate');
  const identifier = `urn:lore-nexus:${safeId(book.id)}`;
  const language = book.language || 'hu';
  const manifest = book.chapters.map((chapter, index) => `<item id="chapter-${index + 1}" href="text/chapter-${index + 1}.xhtml" media-type="application/xhtml+xml"/>`).join('');
  const spine = book.chapters.map((_, index) => `<itemref idref="chapter-${index + 1}"/>`).join('');
  const nav = book.chapters.map((chapter, index) => `<li><a href="text/chapter-${index + 1}.xhtml">${xmlEscape(chapter.title)}</a></li>`).join('');
  const files: Record<string, Uint8Array | [Uint8Array, { level: 0 }]> = {
    mimetype: [strToU8('application/epub+zip'), { level: 0 }],
    'META-INF/container.xml': strToU8('<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'),
    'EPUB/package.opf': strToU8(`<?xml version="1.0" encoding="UTF-8"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="${xmlEscape(language)}"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book-id">${xmlEscape(identifier)}</dc:identifier><dc:title>${xmlEscape(book.title)}</dc:title><dc:language>${xmlEscape(language)}</dc:language><meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/u, 'Z')}</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="css" href="styles.css" media-type="text/css"/>${manifest}</manifest><spine>${spine}</spine></package>`),
    'EPUB/nav.xhtml': strToU8(`<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${xmlEscape(language)}"><head><title>${xmlEscape(book.title)}</title><link rel="stylesheet" href="styles.css"/></head><body><nav epub:type="toc"><h1>${xmlEscape(book.title)}</h1><ol>${nav}</ol></nav></body></html>`),
    'EPUB/styles.css': strToU8('body{font-family:serif;line-height:1.6;margin:5%;}h1{page-break-before:always;}p{orphans:2;widows:2;}img{max-width:100%;height:auto;}'),
  };
  book.chapters.forEach((chapter, index) => {
    files[`EPUB/text/chapter-${index + 1}.xhtml`] = strToU8(`<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml" lang="${xmlEscape(language)}"><head><title>${xmlEscape(chapter.title)}</title><link rel="stylesheet" href="../styles.css"/></head><body><section epub:type="chapter" xmlns:epub="http://www.idpf.org/2007/ops"><h1>${xmlEscape(chapter.title)}</h1>${safeChapterMarkup(chapter.content)}</section></body></html>`);
  });
  return new Blob([zipSync(files, { level: 6 })], { type: 'application/epub+zip' });
}
