import test from 'node:test';
import assert from 'node:assert/strict';
import { witcherGameCodexArticles } from '../../src/data/articles/witcher-game-codex.ts';

test('Witcher game codex records remain isolated and carry provenance metadata', () => {
  const records = Object.values(witcherGameCodexArticles);
  assert.ok(records.length >= 10);
  assert.ok(records.every(article => article.universeId === 'witcher'));
  assert.ok(records.every(article => article.continuity === 'cdpr-games'));
  assert.ok(records.every(article => article.loreAndMechanicsSeparated === true));
  assert.ok(records.every(article => Array.isArray(article.games) && article.games.length > 0));
  assert.equal(new Set(records.map(article => article.id)).size, records.length);
});

test('central game codex links every principal catalogue', () => {
  const hub = witcherGameCodexArticles['witcher-game-codex'];
  for (const id of ['witcher-game-characters','witcher-game-bestiary','witcher-game-readables','witcher-game-alchemy','witcher-game-places-power','witcher-game-quests','witcher-game-equipment','witcher-game-gwent']) {
    assert.ok(witcherGameCodexArticles[id]);
    assert.match(hub.content, new RegExp(`\\[\\[${id}\\|`));
  }
});
