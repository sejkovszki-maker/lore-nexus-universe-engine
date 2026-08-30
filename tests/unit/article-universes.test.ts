import assert from 'node:assert/strict';
import { test } from 'node:test';
import { availableUniverses, detectArticleUniverse } from '../../src/universe/article-universes.ts';

test('foreign lore is separated from Diablo with explainable confidence', () => {
  const witcher = detectArticleUniverse('Geralt története', 'A witcher Yennefer és Ciri társaságában Nilfgaard felé indult.');
  assert.equal(witcher.universe.id, 'witcher');
  assert.ok(witcher.confidence >= .8);
  const diablo = detectArticleUniverse('A Horadrim', 'Tyrael Sanctuary védelmében Diablo ellen harcolt.');
  assert.equal(diablo.universe.id, 'diablo');
});

test('unknown content receives an isolated universe instead of contaminating Diablo', () => {
  const result = detectArticleUniverse('Csillagjárók krónikája', 'Távoli csillagok között hajóztak.', 'diablo');
  assert.notEqual(result.universe.id, 'diablo');
  const universes = availableUniverses({ one: { id: 'one', title: 'Geralt', category: 'Karakter', content: '', universeId: 'witcher', universeLabel: 'The Witcher' } });
  assert.deepEqual(universes.map(item => item.id), ['diablo', 'witcher']);
});
