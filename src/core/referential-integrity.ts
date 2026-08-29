export interface ReferentialRecord {
  id: string;
  references: ReadonlyArray<{ field: string; targetId: string; required: boolean }>;
}

export interface IntegrityViolation {
  recordId: string;
  field: string;
  targetId: string;
  code: 'MISSING_REQUIRED_REFERENCE' | 'DANGLING_OPTIONAL_REFERENCE' | 'SELF_REFERENCE_NOT_ALLOWED';
}

export function validateReferences(records: Iterable<ReferentialRecord>, allowSelfReference = false): IntegrityViolation[] {
  const materialized = [...records];
  const ids = new Set(materialized.map((record) => record.id));
  const violations: IntegrityViolation[] = [];
  for (const record of materialized) {
    for (const reference of record.references) {
      if (!allowSelfReference && reference.targetId === record.id) {
        violations.push({ recordId: record.id, field: reference.field, targetId: reference.targetId, code: 'SELF_REFERENCE_NOT_ALLOWED' });
      } else if (!ids.has(reference.targetId)) {
        violations.push({ recordId: record.id, field: reference.field, targetId: reference.targetId, code: reference.required ? 'MISSING_REQUIRED_REFERENCE' : 'DANGLING_OPTIONAL_REFERENCE' });
      }
    }
  }
  return violations;
}
