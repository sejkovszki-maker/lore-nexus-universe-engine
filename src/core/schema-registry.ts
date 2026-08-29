import Ajv2020, { type ErrorObject, type ValidateFunction } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

export interface SchemaValidationResult {
  valid: boolean;
  errors: ErrorObject[];
}

export class SchemaRegistry {
  readonly #ajv: Ajv2020;
  readonly #versions = new Map<string, Map<number, string>>();

  constructor() {
    this.#ajv = new Ajv2020({ allErrors: true, strict: true });
    addFormats(this.#ajv);
  }

  register(name: string, version: number, schema: object): void {
    if (!/^[a-z][a-z0-9.-]*$/.test(name)) throw new Error(`Invalid schema name: ${name}`);
    if (!Number.isSafeInteger(version) || version < 1) throw new Error(`Invalid schema version: ${version}`);
    const versions = this.#versions.get(name) ?? new Map<number, string>();
    if (versions.has(version)) throw new Error(`Schema already registered: ${name}@${version}`);
    const key = `${name}@${version}`;
    this.#ajv.addSchema(schema, key);
    versions.set(version, key);
    this.#versions.set(name, versions);
  }

  validate(name: string, version: number, value: unknown): SchemaValidationResult {
    const validator = this.#validator(name, version);
    const valid = validator(value) === true;
    return { valid, errors: valid ? [] : [...(validator.errors ?? [])] };
  }

  latestVersion(name: string): number | null {
    const versions = this.#versions.get(name);
    return versions ? Math.max(...versions.keys()) : null;
  }

  #validator(name: string, version: number): ValidateFunction {
    const key = this.#versions.get(name)?.get(version);
    if (!key) throw new Error(`Unknown schema: ${name}@${version}`);
    const validator = this.#ajv.getSchema(key);
    if (!validator) throw new Error(`Schema compiler state missing: ${key}`);
    return validator;
  }
}
