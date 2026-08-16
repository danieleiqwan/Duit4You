import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai/provider";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized access. Authentication is required to check AI status." },
        { status: 401 }
      );
    }

    const provider = getAIProvider();
    const result = await provider.testConnection();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          provider: result.provider,
          message: result.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        provider: result.provider,
        message: result.message,
        details: result.details,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: "Unable to verify AI connectivity.", details: errorMessage },
      { status: 500 }
    );
  }
}
