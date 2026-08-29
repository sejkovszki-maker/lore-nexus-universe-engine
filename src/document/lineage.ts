import type { LineageEdge, LineageNodeKind } from '../domain/source-document';

export class LineageGraph {
  readonly #edges = new Map<string, LineageEdge>();
  add(edge: LineageEdge): void {
    if (this.#edges.has(edge.id)) throw new Error(`Duplicate lineage edge: ${edge.id}`);
    if (edge.from.kind === edge.to.kind && edge.from.id === edge.to.id) throw new Error('Lineage self-edge is forbidden');
    this.#edges.set(edge.id, structuredClone(edge));
  }
  ancestors(kind: LineageNodeKind, id: string): LineageEdge[] {
    const result: LineageEdge[] = []; const queue = [{ kind, id }]; const visited = new Set<string>();
    while (queue.length) {
      const current = queue.shift()!; const key = `${current.kind}:${current.id}`; if (visited.has(key)) continue; visited.add(key);
      for (const edge of this.#edges.values()) if (edge.to.kind === current.kind && edge.to.id === current.id) { result.push(structuredClone(edge)); queue.push(edge.from); }
    }
    return result;
  }
}
