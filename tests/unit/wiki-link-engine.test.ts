import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBacklinkIndex, diagnoseWikiLinks, parseWikiLinks, relatedArticlesFor, renderWikiLinks } from '../../src/wiki/link-engine.ts';

const articles: any = {
  tyrael: { id: 'tyrael', title: 'Tyrael', category: 'Szereplők', content: 'Lásd [[sanctuary|Menedék|location]].' },
  sanctuary: { id: 'sanctuary', title: 'Sanctuary', category: 'Helyszínek', content: 'Világ.' },
  orphan: { id: 'orphan', title: 'Árva', category: 'Teszt', content: '[[missing|hiányzó]].' },
};

test('structured wiki links are parsed and rendered without inline handlers', () => {
  const [link] = parseWikiLinks(articles.tyrael.content);
  assert.deepEqual({ targetId: link.targetId, label: link.label, relationType: link.relationType }, { targetId: 'sanctuary', label: 'Menedék', relationType: 'location' });
  const rendered = renderWikiLinks(articles.tyrael.content, articles);
  assert.match(rendered, /href="#\/wiki\/sanctuary"/);
  assert.doesNotMatch(rendered, /onclick=/i);
});

test('backlinks, broken links, orphan articles and related content are deterministic', () => {
  assert.deepEqual(buildBacklinkIndex(articles).get('sanctuary'), ['tyrael']);
  const diagnostics = diagnoseWikiLinks(articles);
  assert.ok(diagnostics.some(item => item.code === 'broken-link' && item.targetId === 'missing'));
  assert.ok(diagnostics.some(item => item.code === 'orphan-article' && item.articleId === 'tyrael'));
  assert.deepEqual(relatedArticlesFor(articles.sanctuary, articles).map(item => item.id), ['tyrael']);
});
