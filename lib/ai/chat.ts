import { getAIProvider, ChatMessage } from "./provider";
import { FINANCE_TOOL_DEFINITIONS, executeFinanceTool } from "./tools/finance";

export const SYSTEM_PROMPT = `You are Finance Assistant, an intelligent, helpful, and concise personal finance AI assistant for the DuitWise application.

Core Rules & Guidelines:
1. CURRENCY: Always format currency values in Malaysian Ringgit (RM, e.g., RM450.00, RM1,200.50).
2. DATA ACCURACY: Never invent, guess, or fabricate financial numbers, balances, or transactions. Rely strictly on the structured data provided by financial tools.
3. UNRELATED QUESTIONS: If a user asks a general knowledge or unrelated non-financial question (e.g. "What is the capital of France?"), respond politely: "I'm your Finance Assistant, so I can help with questions about your finances and transactions."
4. FINANCIAL ADVICE BOUNDARIES: Provide simple informational observations based on retrieved transaction data. Do NOT offer professional financial advice, investment recommendations, or guarantee future financial outcomes.
5. CLARIFICATION: If a request is missing essential information, ask a simple polite clarifying question.
6. CONCISE & READABLE: Keep responses clear, professional, friendly, and easy to read using clean Markdown formatting.
7. NO DATA INVENTION: If a tool returns zero transactions or empty results for a period, explain that there are no recorded transactions for that period. Never fill in made-up numbers.`;

const MAX_INPUT_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_TOOL_LOOPS = 5;

export async function processAIChat({
  userId,
  messages,
}: {
  userId: number;
  messages: ChatMessage[];
}): Promise<ChatMessage> {
  const provider = getAIProvider();

  // Sanitize: filter valid roles, truncate content, cap count
  const sanitizedInputMessages = (messages || [])
    .filter(
      (m) =>
        m &&
        typeof m.content === "string" &&
        ["user", "assistant"].includes(m.role)
    )
    .map((m) => ({
      ...m,
      content: m.content.slice(0, MAX_MESSAGE_LENGTH),
    }))
    .slice(-MAX_INPUT_MESSAGES);

  // Build initial conversation: system prompt + sanitized user/assistant history
  const conversationMessages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...sanitizedInputMessages,
  ];

  let currentLoop = 0;

  while (currentLoop < MAX_TOOL_LOOPS) {
    currentLoop++;

    const response = await provider.chatCompletion({
      messages: conversationMessages,
      tools: FINANCE_TOOL_DEFINITIONS,
      temperature: 0.1,
    });

    // If no tool calls were requested, return the assistant's text response
    if (!response.toolCalls || response.toolCalls.length === 0) {
      return response.message;
    }

    // Push the full assistant message (with tool_calls) so Groq can correlate tool results
    conversationMessages.push(response.message);

    // Execute each tool call from the AI
    for (const call of response.toolCalls) {
      try {
        const toolResult = await executeFinanceTool(call.name, call.arguments, userId);
        conversationMessages.push({
          role: "tool",
          name: call.name,
          tool_call_id: call.id,
          content: JSON.stringify(toolResult),
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Error executing financial tool.";
        conversationMessages.push({
          role: "tool",
          name: call.name,
          tool_call_id: call.id,
          content: JSON.stringify({ error: errorMsg }),
        });
      }
    }
  }

  return {
    role: "assistant",
    content: "I gathered your financial data but could not formulate a final answer. Please try asking again.",
  };
}
