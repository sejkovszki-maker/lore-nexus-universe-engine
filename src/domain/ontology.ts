export interface OntologyType {
  id: string;
  kind: 'entity' | 'relationship' | 'event' | 'claim';
  label: Record<string, string>;
  parentTypeId?: string;
  requiredProperties: string[];
  allowedProperties: string[];
}

export interface OntologyVersion {
  ontologyId: string;
  version: number;
  previousVersion: number | null;
  releasedAtUtc: string;
  types: OntologyType[];
}

export class OntologyEngine {
  readonly #versions = new Map<string, OntologyVersion[]>();

  register(ontology: OntologyVersion): void {
    const history = this.#versions.get(ontology.ontologyId) ?? [];
    const expectedVersion = history.length + 1;
    if (ontology.version !== expectedVersion) throw new Error(`Expected ontology version ${expectedVersion}`);
    if (ontology.previousVersion !== (history.at(-1)?.version ?? null)) throw new Error('Invalid ontology version chain');
    const ids = new Set(ontology.types.map((type) => type.id));
    if (ids.size !== ontology.types.length) throw new Error('Duplicate ontology type id');
    for (const type of ontology.types) {
      if (type.parentTypeId && !ids.has(type.parentTypeId)) throw new Error(`Unknown parent type: ${type.parentTypeId}`);
      const allowed = new Set(type.allowedProperties);
      if (type.requiredProperties.some((property) => !allowed.has(property))) throw new Error(`Required property is not allowed: ${type.id}`);
    }
    history.push(structuredClone(ontology));
    this.#versions.set(ontology.ontologyId, history);
  }

  latest(ontologyId: string): OntologyVersion | null {
    const value = this.#versions.get(ontologyId)?.at(-1);
    return value ? structuredClone(value) : null;
  }

  isBackwardCompatible(ontologyId: string, candidate: OntologyVersion): boolean {
    const current = this.latest(ontologyId);
    if (!current) return candidate.version === 1;
    const candidateById = new Map(candidate.types.map((type) => [type.id, type]));
    return current.types.every((oldType) => {
      const next = candidateById.get(oldType.id);
      if (!next || next.kind !== oldType.kind) return false;
      return oldType.requiredProperties.every((property) => next.allowedProperties.includes(property));
    });
  }
}
