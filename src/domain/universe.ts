import type { UniverseId } from '../core/contracts';

export interface Universe {
  id: UniverseId;
  schemaVersion: 1;
  slug: string;
  name: string;
  description?: string;
  defaultLocale: string;
  supportedLocales: string[];
  createdAtUtc: string;
  status: 'draft' | 'active' | 'archived';
  metadata?: Record<string, string | number | boolean | null>;
}
