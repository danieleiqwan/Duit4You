import Groq from "groq-sdk";
import { AIProvider, AIChatParams, AIChatResponse, AIHealthResult } from "./provider";

export const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

export class GroqProvider implements AIProvider {
  public readonly name = "Groq";
  private client: Groq | null = null;

  private getClient(): Groq {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      throw new Error("GROQ_API_KEY environment variable is not configured on the server.");
    }
    if (!this.client) {
      this.client = new Groq({ apiKey });
    }
    return this.client;
  }

  public async testConnection(): Promise<AIHealthResult> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey.trim() === "") {
      return {
        success: false,
        message: "GROQ_API_KEY is missing in server environment variables.",
        provider: this.name,
      };
    }

    try {
      const groq = this.getClient();
      // Test connectivity by listing available models
      const modelsList = await groq.models.list();

      const hasModels = Array.isArray(modelsList.data) && modelsList.data.length > 0;

      if (!hasModels) {
        return {
          success: false,
          message: "Groq API returned an empty models list.",
          provider: this.name,
        };
      }

      return {
        success: true,
        message: "Groq API connection successfully established.",
        provider: this.name,
        details: {
          availableModelsCount: modelsList.data.length,
          defaultModel: DEFAULT_GROQ_MODEL,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to communicate with Groq API.";
      return {
        success: false,
        message: errorMessage,
        provider: this.name,
      };
    }
  }

  public async chatCompletion(params: AIChatParams): Promise<AIChatResponse> {
    const groq = this.getClient();
    const model = params.model || DEFAULT_GROQ_MODEL;

    // Convert tool definitions to Groq function format if provided
    const tools = params.tools?.map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));

    const response = await groq.chat.completions.create({
      model,
      messages: params.messages.map((m): Groq.Chat.Completions.ChatCompletionMessageParam => {
        if (m.role === "system") {
          return { role: "system", content: m.content };
        }
        if (m.role === "assistant") {
          // If this assistant message has tool_calls, include them
          if (m.tool_calls && m.tool_calls.length > 0) {
            return {
              role: "assistant",
              content: m.content || null,
              tool_calls: m.tool_calls.map((tc) => ({
                id: tc.id,
                type: "function" as const,
                function: {
                  name: tc.function.name,
                  arguments: tc.function.arguments,
                },
              })),
            };
          }
          return { role: "assistant", content: m.content };
        }
        if (m.role === "tool") {
          return { role: "tool", content: m.content, tool_call_id: m.tool_call_id || "" };
        }
        return { role: "user", content: m.content };
      }),
      ...(tools && tools.length > 0 ? { tools, tool_choice: "auto" as const } : {}),
      temperature: params.temperature ?? 0.2,
    });

    const choice = response.choices[0];
    if (!choice || !choice.message) {
      throw new Error("Invalid response format received from Groq API.");
    }

    // Build the raw tool_calls for the assistant message (to allow round-tripping)
    const rawToolCalls = choice.message.tool_calls?.map((tc) => ({
      id: tc.id,
      type: "function" as const,
      function: {
        name: tc.function.name,
        arguments: tc.function.arguments,
      },
    }));

    // Build parsed tool calls for the caller
    const toolCalls = choice.message.tool_calls?.map((tc) => {
      let parsedArgs: Record<string, unknown> = {};
      try {
        parsedArgs = JSON.parse(tc.function.arguments || "{}");
      } catch {
        parsedArgs = {};
      }
      return {
        id: tc.id,
        name: tc.function.name,
        arguments: parsedArgs,
      };
    });

    return {
      message: {
        role: "assistant",
        content: choice.message.content || "",
        ...(rawToolCalls && rawToolCalls.length > 0 ? { tool_calls: rawToolCalls } : {}),
      },
      toolCalls,
      finishReason: choice.finish_reason,
    };
  }
}
