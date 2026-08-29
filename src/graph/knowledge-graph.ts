export type GraphNodeKind = 'entity' | 'fact' | 'claim' | 'event' | 'document' | 'chunk' | 'source';
export interface GraphNode { id: string; universeId: string; kind: GraphNodeKind; label: string; storageRef: string; attributes?: Record<string, string | number | boolean | null> }
export interface GraphEdge { id: string; universeId: string; type: string; from: string; to: string; directed: boolean; storageRef: string; weight?: number }
export interface GraphIntegrityIssue { code: 'DANGLING_FROM' | 'DANGLING_TO' | 'CROSS_UNIVERSE' | 'SELF_EDGE' | 'INVALID_WEIGHT'; edgeId: string }
export interface TraversalPath { nodeIds: string[]; edgeIds: string[] }
export interface GraphPage<T> { items: T[]; nextCursor: string | null; total: number }

function page<T>(items: T[], limit: number, cursor?: string): GraphPage<T> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw new Error('Limit must be between 1 and 500');
  const offset = cursor ? Number.parseInt(cursor, 36) : 0;
  if (!Number.isInteger(offset) || offset < 0) throw new Error('Invalid cursor');
  const selected = items.slice(offset, offset + limit); const next = offset + selected.length;
  return { items: structuredClone(selected), nextCursor: next < items.length ? next.toString(36) : null, total: items.length };
}

export class KnowledgeGraph {
  #nodes = new Map<string, GraphNode>(); #edges = new Map<string, GraphEdge>();
  #out = new Map<string, Set<string>>(); #in = new Map<string, Set<string>>(); #kindIndex = new Map<string, Set<string>>(); #tokenIndex = new Map<string, Set<string>>();
  get nodeCount(): number { return this.#nodes.size; } get edgeCount(): number { return this.#edges.size; }

  addNode(node: GraphNode): void {
    if (this.#nodes.has(node.id)) throw new Error(`Duplicate graph node: ${node.id}`); if (!node.universeId || !node.storageRef) throw new Error('Node universe and storageRef are required');
    this.#nodes.set(node.id, structuredClone(node)); this.#indexNode(node);
  }
  addEdge(edge: GraphEdge): void {
    if (this.#edges.has(edge.id)) throw new Error(`Duplicate graph edge: ${edge.id}`);
    const issues = this.#edgeIssues(edge); if (issues.length) throw new Error(`${issues[0].code}: ${edge.id}`);
    this.#edges.set(edge.id, structuredClone(edge)); this.#link(this.#out, edge.from, edge.id); this.#link(this.#in, edge.to, edge.id);
    if (!edge.directed) { this.#link(this.#out, edge.to, edge.id); this.#link(this.#in, edge.from, edge.id); }
  }
  addBatch(nodes: GraphNode[], edges: GraphEdge[]): void {
    const clone = this.clone(); for (const node of nodes) clone.addNode(node); for (const edge of edges) clone.addEdge(edge);
    this.#nodes = clone.#nodes; this.#edges = clone.#edges; this.#out = clone.#out; this.#in = clone.#in; this.#kindIndex = clone.#kindIndex; this.#tokenIndex = clone.#tokenIndex;
  }
  getNode(id: string): GraphNode | null { const found = this.#nodes.get(id); return found ? structuredClone(found) : null; }
  nodesByKind(universeId: string, kind: GraphNodeKind, limit = 100, cursor?: string): GraphPage<GraphNode> {
    const ids = [...(this.#kindIndex.get(`${universeId}:${kind}`) ?? [])].sort(); return page(ids.map((id) => this.#nodes.get(id)!), limit, cursor);
  }
  search(universeId: string, query: string, limit = 50, cursor?: string): GraphPage<GraphNode> {
    const tokens = this.#tokens(query); if (!tokens.length) return page([], limit, cursor);
    const matches = tokens.map((token) => this.#tokenIndex.get(`${universeId}:${token}`) ?? new Set<string>());
    const ids = [...matches.reduce((left, right) => new Set([...left].filter((id) => right.has(id))))].sort();
    return page(ids.map((id) => this.#nodes.get(id)!), limit, cursor);
  }
  neighbors(universeId: string, nodeId: string, edgeType?: string): GraphNode[] {
    const node = this.#nodes.get(nodeId); if (!node || node.universeId !== universeId) return [];
    const ids = new Set<string>(); for (const edgeId of this.#out.get(nodeId) ?? []) { const edge = this.#edges.get(edgeId)!; if (!edgeType || edge.type === edgeType) ids.add(edge.from === nodeId ? edge.to : edge.from); }
    return [...ids].sort().map((id) => structuredClone(this.#nodes.get(id)!));
  }
  traverse(universeId: string, startId: string, maxHops: number, options: { edgeTypes?: string[]; maxVisited?: number } = {}): TraversalPath[] {
    if (maxHops < 1 || maxHops > 12) throw new Error('maxHops must be between 1 and 12'); const maxVisited = options.maxVisited ?? 10_000;
    const start = this.#nodes.get(startId); if (!start || start.universeId !== universeId) return [];
    const paths: TraversalPath[] = []; const queue: TraversalPath[] = [{ nodeIds: [startId], edgeIds: [] }]; let visited = 0;
    while (queue.length) {
      const current = queue.shift()!; if (++visited > maxVisited) throw new Error('Traversal resource limit exceeded'); if (current.edgeIds.length >= maxHops) continue;
      const tail = current.nodeIds.at(-1)!;
      for (const edgeId of [...(this.#out.get(tail) ?? [])].sort()) {
        const edge = this.#edges.get(edgeId)!; if (options.edgeTypes && !options.edgeTypes.includes(edge.type)) continue;
        const next = edge.from === tail ? edge.to : edge.from; if (current.nodeIds.includes(next)) continue;
        const candidate = { nodeIds: [...current.nodeIds, next], edgeIds: [...current.edgeIds, edgeId] }; paths.push(candidate); queue.push(candidate);
      }
    } return paths;
  }
  integrityIssues(): GraphIntegrityIssue[] { return [...this.#edges.values()].flatMap((edge) => this.#edgeIssues(edge)); }
  clone(): KnowledgeGraph { const result = new KnowledgeGraph(); for (const node of this.#nodes.values()) result.addNode(node); for (const edge of this.#edges.values()) result.addEdge(edge); return result; }

  #edgeIssues(edge: GraphEdge): GraphIntegrityIssue[] {
    const issues: GraphIntegrityIssue[] = []; const from = this.#nodes.get(edge.from); const to = this.#nodes.get(edge.to);
    if (!from) issues.push({ code: 'DANGLING_FROM', edgeId: edge.id }); if (!to) issues.push({ code: 'DANGLING_TO', edgeId: edge.id });
    if (from && to && (from.universeId !== edge.universeId || to.universeId !== edge.universeId)) issues.push({ code: 'CROSS_UNIVERSE', edgeId: edge.id });
    if (edge.from === edge.to) issues.push({ code: 'SELF_EDGE', edgeId: edge.id }); if (edge.weight !== undefined && (!Number.isFinite(edge.weight) || edge.weight < 0)) issues.push({ code: 'INVALID_WEIGHT', edgeId: edge.id }); return issues;
  }
  #link(index: Map<string, Set<string>>, key: string, value: string): void { const values = index.get(key) ?? new Set<string>(); values.add(value); index.set(key, values); }
  #tokens(value: string): string[] { return [...new Set(value.normalize('NFKC').toLocaleLowerCase('en-US').split(/[^\p{L}\p{N}]+/u).filter(Boolean))]; }
  #indexNode(node: GraphNode): void { this.#link(this.#kindIndex, `${node.universeId}:${node.kind}`, node.id); for (const token of this.#tokens(node.label)) this.#link(this.#tokenIndex, `${node.universeId}:${token}`, node.id); }
}
