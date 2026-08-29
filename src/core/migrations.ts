export interface MigrationContext { execute(statement: string, parameters?: readonly unknown[]): Promise<void>; }
export interface Migration { version: number; name: string; up(context: MigrationContext): Promise<void>; down(context: MigrationContext): Promise<void>; }

export class MigrationRegistry {
  readonly #migrations = new Map<number, Migration>();
  register(migration: Migration): void {
    if (!Number.isSafeInteger(migration.version) || migration.version < 1) throw new Error('Migration version must be a positive integer');
    if (this.#migrations.has(migration.version)) throw new Error(`Duplicate migration version: ${migration.version}`);
    this.#migrations.set(migration.version, migration);
  }
  plan(currentVersion: number, targetVersion = this.latestVersion()): Migration[] {
    if (targetVersion < currentVersion) throw new Error('Use rollbackPlan for downward migrations');
    const plan = [...this.#migrations.values()].filter((item) => item.version > currentVersion && item.version <= targetVersion).sort((a, b) => a.version - b.version);
    if (plan.some((migration, index) => migration.version !== currentVersion + index + 1)) throw new Error('Migration chain contains a gap');
    return plan;
  }
  rollbackPlan(currentVersion: number, targetVersion: number): Migration[] {
    if (targetVersion > currentVersion) throw new Error('Rollback target must not exceed current version');
    return [...this.#migrations.values()].filter((item) => item.version <= currentVersion && item.version > targetVersion).sort((a, b) => b.version - a.version);
  }
  latestVersion(): number { return Math.max(0, ...this.#migrations.keys()); }
}

export interface MigrationStateStore { currentVersion(): Promise<number>; setVersion(version: number): Promise<void>; }

export class MigrationExecutor {
  readonly registry: MigrationRegistry;
  readonly state: MigrationStateStore;
  readonly context: MigrationContext;
  constructor(registry: MigrationRegistry, state: MigrationStateStore, context: MigrationContext) {
    this.registry = registry;
    this.state = state;
    this.context = context;
  }
  async migrate(targetVersion = this.registry.latestVersion()): Promise<void> {
    const current = await this.state.currentVersion();
    for (const migration of this.registry.plan(current, targetVersion)) {
      await migration.up(this.context);
      await this.state.setVersion(migration.version);
    }
  }
  async rollback(targetVersion: number): Promise<void> {
    const current = await this.state.currentVersion();
    for (const migration of this.registry.rollbackPlan(current, targetVersion)) {
      await migration.down(this.context);
      await this.state.setVersion(migration.version - 1);
    }
  }
}
