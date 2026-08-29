export interface LlmMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}

export interface LlmRequest {
  messages: LlmMessage[];
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseSchema?: Record<string, unknown>;
}

export interface LlmResponse {
  provider: string;
  model: string;
  content: string;
  structuredOutput?: unknown;
  inputTokens?: number;
  outputTokens?: number;
  requestId?: string;
}

export interface LlmProvider {
  readonly providerId: string;
  readonly capabilities: ReadonlySet<'text' | 'vision' | 'tools' | 'structured-output' | 'embeddings'>;
  generate(request: LlmRequest, signal?: AbortSignal): Promise<LlmResponse>;
  healthCheck(): Promise<boolean>;
}
