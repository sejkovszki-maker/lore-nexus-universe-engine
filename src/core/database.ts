export interface Transaction {
  readonly id: string;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface Repository<TRecord extends { id: string }> {
  get(id: string): Promise<TRecord | null>;
  put(record: TRecord, transaction?: Transaction): Promise<void>;
  delete(id: string, transaction?: Transaction): Promise<void>;
  list(cursor?: string, limit?: number): Promise<{ items: TRecord[]; nextCursor: string | null }>;
}

export interface DatabaseAdapter {
  readonly adapterName: string;
  beginTransaction(): Promise<Transaction>;
  repository<TRecord extends { id: string }>(collection: string): Repository<TRecord>;
  healthCheck(): Promise<{ healthy: boolean; latencyMs: number }>;
  migrate(targetVersion?: number): Promise<void>;
}
