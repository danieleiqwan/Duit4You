import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateTransactionInput } from "@/lib/validations/transaction";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user session." }, { status: 401 });
    }

    const { id } = await params;
    const transactionId = parseInt(id, 10);
    if (isNaN(transactionId)) {
      return NextResponse.json({ error: "Invalid transaction ID." }, { status: 400 });
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
    }

    const formattedTransaction = {
      ...transaction,
      amount: Number(transaction.amount.toString()),
      transactionDate: transaction.transactionDate.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
    };

    return NextResponse.json({ transaction: formattedTransaction }, { status: 200 });
  } catch (error) {
    console.error("Error fetching single transaction:", error);
    return NextResponse.json(
      { error: "Unable to retrieve transaction. Please try again." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user session." }, { status: 401 });
    }

    const { id } = await params;
    const transactionId = parseInt(id, 10);
    if (isNaN(transactionId)) {
      return NextResponse.json({ error: "Invalid transaction ID." }, { status: 400 });
    }

    // Verify ownership
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
    }

    const body = await request.json();
    const validation = validateTransactionInput(body);

    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        { error: "Validation failed.", errors: validation.errors },
        { status: 400 }
      );
    }

    const { type, amount, category, description, transactionDate } = validation.data;

    const updatedTransaction = await prisma.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        type,
        amount,
        category,
        description,
        transactionDate,
      },
    });

    const formattedTransaction = {
      ...updatedTransaction,
      amount: Number(updatedTransaction.amount.toString()),
      transactionDate: updatedTransaction.transactionDate.toISOString(),
      createdAt: updatedTransaction.createdAt.toISOString(),
    };

    return NextResponse.json(
      { message: "Transaction updated successfully.", transaction: formattedTransaction },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Unable to update transaction. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user session." }, { status: 401 });
    }

    const { id } = await params;
    const transactionId = parseInt(id, 10);
    if (isNaN(transactionId)) {
      return NextResponse.json({ error: "Invalid transaction ID." }, { status: 400 });
    }

    // Verify ownership
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
    }

    await prisma.transaction.delete({
      where: {
        id: transactionId,
      },
    });

    return NextResponse.json(
      { message: "Transaction deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Unable to delete transaction. Please try again." },
      { status: 500 }
    );
  }
}
