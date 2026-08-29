export type DataClassification = 'public' | 'internal' | 'restricted';
export interface AgentIdentity { id: string; universeIds: string[]; toolIds: string[]; clearance: DataClassification; mayRequestApproval: boolean }
export interface ToolDefinition<I = unknown, O = unknown> { id: string; risk: 'read' | 'write' | 'destructive'; execute(input: I, signal?: AbortSignal): Promise<O> }
export interface Approval { id: string; agentId: string; toolId: string; inputFingerprint: string; approvedBy: string; expiresAtUtc: string; used: boolean }
export interface RetrievalRecord { id: string; universeId: string; classification: DataClassification; qualityScore: number; citationComplete: boolean; content: string }
const level: Record<DataClassification, number> = { public: 0, internal: 1, restricted: 2 };

async function sha256(value: unknown): Promise<string> { const bytes = new TextEncoder().encode(JSON.stringify(value)); const digest = await crypto.subtle.digest('SHA-256', bytes); return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, '0')).join(''); }
export function promptInjectionSignals(text: string): string[] { const patterns: Array<[string, RegExp]> = [['instruction-override', /ignore (all |any )?(previous|prior|system) instructions?/iu], ['role-forgery', /(?:^|\n)\s*(system|assistant|developer)\s*:/iu], ['secret-exfiltration', /(reveal|print|return).{0,30}(secret|token|api.?key|system prompt)/iu], ['tool-coercion', /(run|call|execute).{0,30}(tool|command|shell)/iu], ['delimiter-escape', /<\/?(?:system|assistant|tool)>|```(?:system|tool)/iu]]; return patterns.filter(([, regex]) => regex.test(text)).map(([id]) => id); }
export function isolateUntrustedContext(records: RetrievalRecord[]): string { return records.map((record) => `<untrusted-source id="${record.id}">\n${record.content.replace(/<\/untrusted-source>/giu, '&lt;/untrusted-source&gt;')}\n</untrusted-source>`).join('\n'); }
export function sanitizeModelOutput(value: string): string { return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, '').replace(/javascript\s*:/giu, 'blocked:').trim(); }

export class ApprovalGate {
  #approvals = new Map<string, Approval>();
  async issue(agent: AgentIdentity, toolId: string, input: unknown, approvedBy: string, expiresAtUtc: string): Promise<Approval> { if (!agent.mayRequestApproval || !approvedBy || Date.parse(expiresAtUtc) <= Date.now()) throw new Error('Approval cannot be issued'); const approval = { id: `approval:${crypto.randomUUID()}`, agentId: agent.id, toolId, inputFingerprint: await sha256(input), approvedBy, expiresAtUtc, used: false }; this.#approvals.set(approval.id, approval); return structuredClone(approval); }
  async consume(id: string, agentId: string, toolId: string, input: unknown): Promise<void> { const item = this.#approvals.get(id); if (!item || item.used || item.agentId !== agentId || item.toolId !== toolId || item.inputFingerprint !== await sha256(input) || Date.parse(item.expiresAtUtc) <= Date.now()) throw new Error('Valid single-use approval required'); item.used = true; }
}

export class LeastPrivilegeToolRunner {
  #tools = new Map<string, ToolDefinition>();
  readonly approvals: ApprovalGate;
  constructor(approvals: ApprovalGate) { this.approvals = approvals; }
  register(tool: ToolDefinition): void { if (this.#tools.has(tool.id)) throw new Error(`Duplicate tool: ${tool.id}`); this.#tools.set(tool.id, tool); }
  async run<I, O>(agent: AgentIdentity, toolId: string, input: I, options: { universeId: string; approvalId?: string; signal?: AbortSignal }): Promise<O> {
    const tool = this.#tools.get(toolId); if (!tool || !agent.toolIds.includes(toolId)) throw new Error('Tool is not allowlisted for agent'); if (!agent.universeIds.includes(options.universeId)) throw new Error('Agent has no universe access');
    if (tool.risk !== 'read') { if (!options.approvalId) throw new Error('Explicit approval required'); await this.approvals.consume(options.approvalId, agent.id, toolId, input); }
    return tool.execute(input, options.signal) as Promise<O>;
  }
}

export class AuthorizedRetriever {
  retrieve(agent: AgentIdentity, records: RetrievalRecord[], universeId: string, minimumQuality = 70): { accepted: RetrievalRecord[]; rejected: Array<{ id: string; reason: string }> } {
    if (!agent.universeIds.includes(universeId)) throw new Error('Agent has no universe access'); const accepted: RetrievalRecord[] = []; const rejected: Array<{ id: string; reason: string }> = [];
    for (const record of records) { let reason = ''; if (record.universeId !== universeId) reason = 'cross-universe'; else if (level[record.classification] > level[agent.clearance]) reason = 'classification'; else if (record.qualityScore < minimumQuality) reason = 'quality'; else if (!record.citationComplete) reason = 'citation'; else if (promptInjectionSignals(record.content).length) reason = 'prompt-injection'; if (reason) rejected.push({ id: record.id, reason }); else accepted.push(structuredClone(record)); }
    return { accepted, rejected };
  }
}

export interface EvidenceAnswer { text: string; claims: Array<{ text: string; evidenceIds: string[]; confidence: number }> }
export function hallucinationGuard(answer: EvidenceAnswer, allowedEvidenceIds: string[]): string[] { const allowed = new Set(allowedEvidenceIds); const errors: string[] = []; if (!answer.text.trim()) errors.push('empty-answer'); for (const [index, claim] of answer.claims.entries()) { if (!claim.text.trim()) errors.push(`claim-${index}-empty`); if (!claim.evidenceIds.length) errors.push(`claim-${index}-uncited`); if (claim.evidenceIds.some((id) => !allowed.has(id))) errors.push(`claim-${index}-unknown-evidence`); if (claim.confidence < 0 || claim.confidence > 1) errors.push(`claim-${index}-invalid-confidence`); } return errors; }

export interface AiRunProvenance { runId: string; provider: string; model: string; modelVersion: string; promptId: string; promptVersion: number; inputFingerprint: string; parametersFingerprint: string; outputFingerprint: string; createdAtUtc: string }
export async function createRunProvenance(input: Omit<AiRunProvenance, 'inputFingerprint' | 'parametersFingerprint' | 'outputFingerprint'> & { requestInput: unknown; parameters: unknown; output: unknown }): Promise<AiRunProvenance> { return { runId: input.runId, provider: input.provider, model: input.model, modelVersion: input.modelVersion, promptId: input.promptId, promptVersion: input.promptVersion, inputFingerprint: await sha256(input.requestInput), parametersFingerprint: await sha256(input.parameters), outputFingerprint: await sha256(input.output), createdAtUtc: input.createdAtUtc }; }
