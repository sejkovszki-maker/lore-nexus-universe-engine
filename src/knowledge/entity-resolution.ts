import type { Alias, Entity } from '../domain/knowledge.ts';
import { normalizeAlias } from './entity-registry.ts';

export interface EntityMention { universeId: string; text: string; locale?: string; expectedTypeId?: string; contextTerms?: string[]; }
export interface ResolutionCandidate { entityId: string; score: number; decision: 'exact' | 'probable' | 'possible'; signals: { exactAlias: number; nameSimilarity: number; typeMatch: number; localeMatch: number; contextOverlap: number }; }
export interface ResolutionResult { mention: EntityMention; candidates: ResolutionCandidate[]; existingEntityId: string | null; ambiguous: boolean; }

function levenshtein(left: string, right: string): number {
  const matrix = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0)); for (let i = 0; i <= left.length; i += 1) matrix[i][0] = i; for (let j = 0; j <= right.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= left.length; i += 1) for (let j = 1; j <= right.length; j += 1) { const cost = left[i - 1] === right[j - 1] ? 0 : 1; matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost); if (i > 1 && j > 1 && left[i - 1] === right[j - 2] && left[i - 2] === right[j - 1]) matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1); }
  return matrix[left.length][right.length];
}
export function nameSimilarity(left: string, right: string): number { const a = normalizeAlias(left); const b = normalizeAlias(right); if (a === b) return 1; const maximum = Math.max(a.length, b.length); return maximum === 0 ? 1 : Math.max(0, 1 - levenshtein(a, b) / maximum); }
function entityTerms(entity: Entity): Set<string> { const values = [...Object.values(entity.canonicalNames), ...Object.values(entity.description), ...Object.values(entity.properties).filter((value): value is string => typeof value === 'string')]; return new Set(values.flatMap((value) => normalizeAlias(value).split(' ')).filter(Boolean)); }

export class EntityResolutionEngine {
  resolve(mention: EntityMention, entities: Entity[], aliases: Alias[]): ResolutionResult {
    const normalizedMention = normalizeAlias(mention.text); const candidates: ResolutionCandidate[] = [];
    for (const entity of entities) {
      if (entity.universeId !== mention.universeId || entity.status !== 'active') continue; const entityAliases = aliases.filter((alias) => alias.entityId === entity.id); const names = [...Object.entries(entity.canonicalNames).map(([locale, value]) => ({ locale, value })), ...entityAliases.map((alias) => ({ locale: alias.locale, value: alias.value }))];
      const exactAlias = names.some((name) => normalizeAlias(name.value) === normalizedMention) ? 1 : 0; const nameScore = Math.max(0, ...names.map((name) => nameSimilarity(mention.text, name.value))); const typeMatch = mention.expectedTypeId ? (entity.typeId === mention.expectedTypeId ? 1 : 0) : 0.5; const localeMatch = mention.locale ? (names.some((name) => name.locale === mention.locale) ? 1 : 0) : 0.5;
      const context = new Set((mention.contextTerms ?? []).flatMap((term) => normalizeAlias(term).split(' ')).filter(Boolean)); const terms = entityTerms(entity); const contextOverlap = context.size ? [...context].filter((term) => terms.has(term)).length / context.size : 0.5;
      const score = exactAlias * 0.45 + nameScore * 0.3 + typeMatch * 0.12 + localeMatch * 0.05 + contextOverlap * 0.08; if (score >= 0.45) candidates.push({ entityId: entity.id, score: Math.round(score * 10_000) / 10_000, decision: exactAlias && score >= 0.9 ? 'exact' : score >= 0.75 ? 'probable' : 'possible', signals: { exactAlias, nameSimilarity: nameScore, typeMatch, localeMatch, contextOverlap } });
    }
    candidates.sort((a, b) => b.score - a.score || a.entityId.localeCompare(b.entityId)); const top = candidates[0]; const ambiguous = Boolean(top && candidates[1] && top.score - candidates[1].score < 0.08); return { mention: structuredClone(mention), candidates, existingEntityId: top && top.score >= 0.85 && !ambiguous ? top.entityId : null, ambiguous };
  }
  duplicates(entities: Entity[], aliases: Alias[], threshold = 0.82): Array<{ leftEntityId: string; rightEntityId: string; score: number }> {
    const result = []; for (let i = 0; i < entities.length; i += 1) for (let j = i + 1; j < entities.length; j += 1) { const left = entities[i]; const right = entities[j]; if (left.universeId !== right.universeId || left.typeId !== right.typeId || left.status !== 'active' || right.status !== 'active') continue; const leftNames = [...Object.values(left.canonicalNames), ...aliases.filter((alias) => alias.entityId === left.id).map((alias) => alias.value)]; const rightNames = [...Object.values(right.canonicalNames), ...aliases.filter((alias) => alias.entityId === right.id).map((alias) => alias.value)]; const score = Math.max(...leftNames.flatMap((a) => rightNames.map((b) => nameSimilarity(a, b)))); if (score >= threshold) result.push({ leftEntityId: left.id, rightEntityId: right.id, score: Math.round(score * 10_000) / 10_000 }); } return result.sort((a, b) => b.score - a.score);
  }
}
