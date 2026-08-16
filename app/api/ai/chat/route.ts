import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { processAIChat } from "@/lib/ai/chat";

const MAX_MESSAGES = 20;
const MAX_BODY_SIZE = 50_000; // 50 KB safety limit

export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to use the Finance Assistant." },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user session." },
        { status: 401 }
      );
    }

    // 2. Parse & validate request body
    let body: unknown;
    try {
      const rawText = await request.text();
      if (rawText.length > MAX_BODY_SIZE) {
        return NextResponse.json(
          { error: "Request payload is too large." },
          { status: 413 }
        );
      }
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request format." },
        { status: 400 }
      );
    }

    const { messages } = body as { messages?: unknown };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required and must not be empty." },
        { status: 400 }
      );
    }

    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json(
        { error: `Too many messages. Maximum is ${MAX_MESSAGES}.` },
        { status: 400 }
      );
    }

    // 3. Validate individual messages
    for (const msg of messages) {
      if (
        !msg ||
        typeof msg !== "object" ||
        typeof msg.role !== "string" ||
        typeof msg.content !== "string"
      ) {
        return NextResponse.json(
          { error: "Each message must have a string 'role' and string 'content'." },
          { status: 400 }
        );
      }

      if (!["user", "assistant"].includes(msg.role)) {
        return NextResponse.json(
          { error: "Message role must be 'user' or 'assistant'." },
          { status: 400 }
        );
      }
    }

    // 4. Process through AI service (userId derived from session only)
    const aiResponse = await processAIChat({
      userId,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    return NextResponse.json(
      {
        message: {
          role: aiResponse.role,
          content: aiResponse.content,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("AI Chat API Error:", error);

    // Detect GROQ_API_KEY configuration issue
    if (error instanceof Error && error.message.includes("GROQ_API_KEY")) {
      return NextResponse.json(
        { error: "The AI service is not configured. Please contact the administrator." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Unable to process your request. Please try again." },
      { status: 500 }
    );
  }
}
