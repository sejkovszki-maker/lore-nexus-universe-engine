export type AppView = 'timeline' | 'articles' | 'article-view' | 'story' | 'books' | 'book' | 'editor' | 'conflicts' | 'search' | 'not-found';

export interface AppRoute {
  view: AppView;
  universeId: string;
  articleId?: string;
  eventId?: string;
  bookId?: string;
  chapterId?: string;
  invalidPath?: string;
}

const SAFE_SEGMENT = /^[a-z0-9][a-z0-9-]{0,119}$/;
const LEGACY_TABS: Record<string, AppView> = { timeline: 'timeline', articles: 'articles', 'article-view': 'article-view', story: 'story', editor: 'editor', conflicts: 'conflicts', books: 'books' };

function safe(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try { value = decodeURIComponent(value).toLowerCase(); } catch { return undefined; }
  return SAFE_SEGMENT.test(value) ? value : undefined;
}

export function parseRoute(hash: string): AppRoute {
  const raw = hash.replace(/^#\/?/, '').replace(/\/+$/, '');
  if (!raw) return { view: 'timeline', universeId: 'diablo' };
  const parts = raw.split('/');
  if (parts[0] === 'tab' && LEGACY_TABS[parts[1]]) {
    const view = LEGACY_TABS[parts[1]];
    const articleId = safe(parts[2]);
    return view === 'article-view' && articleId ? { view, universeId: 'diablo', articleId } : { view, universeId: 'diablo' };
  }
  let universeId = 'diablo';
  if (parts[0] === 'u') {
    const parsedUniverse = safe(parts[1]);
    if (!parsedUniverse) return { view: 'not-found', universeId, invalidPath: raw };
    universeId = parsedUniverse;
    parts.splice(0, 2);
  }
  const [root, first, second] = parts;
  if (root === 'home' || root === 'timeline' && !first) return { view: 'timeline', universeId };
  if (root === 'timeline' && safe(first)) return { view: 'timeline', universeId, eventId: safe(first) };
  if (root === 'wiki' && !first) return { view: 'articles', universeId };
  if (root === 'wiki' && safe(first)) return { view: 'article-view', universeId, articleId: safe(first) };
  if (root === 'story' && !first) return { view: 'story', universeId };
  if (root === 'story' && safe(first)) return { view: 'story', universeId, articleId: safe(first) };
  if (root === 'books' && !first) return { view: 'books', universeId };
  if (root === 'book' && safe(first) && !second) return { view: 'book', universeId, bookId: safe(first) };
  if (root === 'book' && safe(first) && safe(second)) return { view: 'book', universeId, bookId: safe(first), chapterId: safe(second) };
  if (root === 'search') return { view: 'search', universeId };
  if (root === 'editor') return { view: 'editor', universeId };
  if (root === 'conflicts') return { view: 'conflicts', universeId };
  return { view: 'not-found', universeId, invalidPath: raw };
}

export function routeHash(route: AppRoute): string {
  const prefix = route.universeId === 'diablo' ? '#/' : `#/u/${route.universeId}/`;
  switch (route.view) {
    case 'timeline': return `${prefix}timeline${route.eventId ? `/${route.eventId}` : ''}`;
    case 'articles': return `${prefix}wiki`;
    case 'article-view': return `${prefix}wiki/${route.articleId ?? ''}`;
    case 'story': return `${prefix}story${route.articleId ? `/${route.articleId}` : ''}`;
    case 'books': return `${prefix}books`;
    case 'book': return `${prefix}book/${route.bookId ?? ''}${route.chapterId ? `/${route.chapterId}` : ''}`;
    case 'search': return `${prefix}search`;
    case 'editor': return `${prefix}editor`;
    case 'conflicts': return `${prefix}conflicts`;
    default: return `${prefix}404`;
  }
}

export function navigate(route: AppRoute, replace = false): void {
  const next = routeHash(route);
  if (replace) history.replaceState(null, '', next);
  else if (location.hash !== next) location.hash = next;
  else window.dispatchEvent(new HashChangeEvent('hashchange'));
}
