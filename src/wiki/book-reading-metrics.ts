export interface ChapterLike { id: string; title: string; content: string }

export function plainWordCount(html: string) {
  return html.replace(/<[^>]*>/gu, ' ').replace(/&(?:nbsp|amp|quot|lt|gt);/gu, ' ').trim().split(/\s+/u).filter(Boolean).length;
}

export function estimatedReadingMinutes(chapters: ChapterLike[], wordsPerMinute = 220) {
  const safeRate = Number.isFinite(wordsPerMinute) && wordsPerMinute >= 80 ? wordsPerMinute : 220;
  const words = chapters.reduce((sum, chapter) => sum + plainWordCount(chapter.content), 0);
  return words === 0 ? 0 : Math.max(1, Math.ceil(words / safeRate));
}

export function filterChapters<T extends Pick<ChapterLike, 'title'>>(chapters: T[], query: string) {
  const normalized = query.trim().toLocaleLowerCase('hu-HU');
  return normalized ? chapters.filter(chapter => chapter.title.toLocaleLowerCase('hu-HU').includes(normalized)) : chapters;
}
