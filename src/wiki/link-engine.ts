import type { WikiArticle, WikiArticles } from '../types';

export type WikiRelationType = 'references' | 'character' | 'location' | 'event' | 'faction' | 'artifact' | 'related';

export interface WikiLink {
  targetId: string;
  label: string;
  relationType: WikiRelationType;
  start: number;
  end: number;
}

export interface LinkDiagnostic {
  severity: 'error' | 'warning';
  code: 'broken-link' | 'orphan-article';
  articleId: string;
  targetId?: string;
  message: string;
}

const LINK_PATTERN = /\[\[([a-z0-9][a-z0-9-]*)(?:\|([^\]|]+))?(?:\|([a-z]+))?\]\]/gi;
const RELATIONS = new Set<WikiRelationType>(['references', 'character', 'location', 'event', 'faction', 'artifact', 'related']);

export function parseWikiLinks(content: string): WikiLink[] {
  const links: WikiLink[] = [];
  for (const match of content.matchAll(LINK_PATTERN)) {
    const targetId = match[1].toLowerCase();
    const relationCandidate = (match[3] || 'references').toLowerCase() as WikiRelationType;
    links.push({
      targetId,
      label: (match[2] || targetId).trim(),
      relationType: RELATIONS.has(relationCandidate) ? relationCandidate : 'references',
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    });
  }
  return links;
}

export function renderWikiLinks(content: string, articles: WikiArticles): string {
  return content.replace(LINK_PATTERN, (_raw, id: string, label?: string, relation?: string) => {
    const targetId = id.toLowerCase();
    const safeLabel = escapeHtml((label || articles[targetId]?.title || targetId).trim());
    const safeId = escapeHtml(targetId);
    const relationType = RELATIONS.has(relation as WikiRelationType) ? relation : 'references';
    if (!articles[targetId]) {
      return `<span class="wiki-link-broken" data-missing-id="${safeId}" title="Hiányzó szócikk">${safeLabel}</span>`;
    }
    return `<a class="wiki-link" href="#/wiki/${safeId}" data-wiki-id="${safeId}" data-relation="${relationType}">${safeLabel}</a>`;
  });
}

export function buildBacklinkIndex(articles: WikiArticles): Map<string, string[]> {
  const backlinks = new Map<string, Set<string>>();
  for (const article of Object.values(articles)) {
    const targets = new Set([
      ...parseWikiLinks(article.content || '').map(link => link.targetId),
      ...(article.relatedArticles || []),
    ]);
    for (const targetId of targets) {
      if (!articles[targetId] || targetId === article.id) continue;
      if (!backlinks.has(targetId)) backlinks.set(targetId, new Set());
      backlinks.get(targetId)!.add(article.id);
    }
  }
  return new Map([...backlinks].map(([id, sources]) => [id, [...sources].sort()]));
}

export function diagnoseWikiLinks(articles: WikiArticles): LinkDiagnostic[] {
  const diagnostics: LinkDiagnostic[] = [];
  const inbound = buildBacklinkIndex(articles);
  for (const article of Object.values(articles)) {
    const targets = new Set([
      ...parseWikiLinks(article.content || '').map(link => link.targetId),
      ...(article.relatedArticles || []),
    ]);
    for (const targetId of targets) {
      if (!articles[targetId]) diagnostics.push({
        severity: 'error', code: 'broken-link', articleId: article.id, targetId,
        message: `${article.id}: a hivatkozott „${targetId}” szócikk nem létezik.`,
      });
    }
  }
  for (const article of Object.values(articles)) {
    if (articles[article.id] && !inbound.has(article.id) && article.type !== 'chapter') diagnostics.push({
      severity: 'warning', code: 'orphan-article', articleId: article.id,
      message: `${article.id}: nincs bejövő kereszthivatkozása.`,
    });
  }
  return diagnostics.sort((a, b) => a.articleId.localeCompare(b.articleId) || a.code.localeCompare(b.code));
}

export function relatedArticlesFor(article: WikiArticle, articles: WikiArticles, limit = 8): WikiArticle[] {
  const backlinks = buildBacklinkIndex(articles).get(article.id) || [];
  const explicit = article.relatedArticles || [];
  const linked = parseWikiLinks(article.content || '').map(link => link.targetId);
  const ids = [...new Set([...explicit, ...linked, ...backlinks])];
  return ids.map(id => articles[id]).filter((item): item is WikiArticle => Boolean(item) && item.id !== article.id).slice(0, limit);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
}
