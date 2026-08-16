import { GroqProvider } from "./groq";

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  tool_call_id?: string;
  /** Only present on assistant messages that request tool calls */
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface AIChatParams {
  messages: ChatMessage[];
  tools?: ToolDefinition[];
  model?: string;
  temperature?: number;
}

export interface AIChatResponse {
  message: ChatMessage;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }>;
  finishReason?: string;
}

export interface AIHealthResult {
  success: boolean;
  message: string;
  provider: string;
  details?: Record<string, unknown>;
}

export interface AIProvider {
  name: string;
  testConnection(): Promise<AIHealthResult>;
  chatCompletion(params: AIChatParams): Promise<AIChatResponse>;
}

let providerInstance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (!providerInstance) {
    providerInstance = new GroqProvider();
  }
  return providerInstance;
}
