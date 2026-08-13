import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateTransactionInput } from "@/lib/validations/transaction";
import { Prisma } from "@/app/generated/prisma/client";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user session." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const category = searchParams.get("category") || "";
    const dateFilter = searchParams.get("dateFilter") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const whereClause: Prisma.TransactionWhereInput = {
      userId,
    };

    if (type && type !== "ALL") {
      if (type === "INCOME" || type === "EXPENSE") {
        whereClause.type = type;
      }
    }

    if (category && category !== "ALL") {
      whereClause.category = category;
    }

    if (search && search.trim() !== "") {
      whereClause.description = {
        contains: search.trim(),
      };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (dateFilter === "THIS_MONTH") {
      const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1));
      const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));
      whereClause.transactionDate = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    } else if (dateFilter === "LAST_MONTH") {
      const startOfLastMonth = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
      const endOfLastMonth = new Date(Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999));
      whereClause.transactionDate = {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      };
    } else if (dateFilter === "CUSTOM" && startDate && endDate) {
      const start = new Date(`${startDate.trim()}T00:00:00.000Z`);
      const end = new Date(`${endDate.trim()}T23:59:59.999Z`);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        whereClause.transactionDate = {
          gte: start,
          lte: end,
        };
      }
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: [
          { transactionDate: "desc" },
          { createdAt: "desc" },
        ],
      }),
      prisma.transaction.count({
        where: { userId },
      }),
    ]);

    const formattedTransactions = transactions.map((t) => ({
      ...t,
      amount: Number(t.amount.toString()),
      transactionDate: t.transactionDate.toISOString(),
      createdAt: t.createdAt.toISOString(),
    }));

    return NextResponse.json(
      { transactions: formattedTransactions, totalCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Unable to retrieve transactions. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user session." }, { status: 401 });
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

    const newTransaction = await prisma.transaction.create({
      data: {
        userId,
        type,
        amount,
        category,
        description,
        transactionDate,
      },
    });

    const formattedTransaction = {
      ...newTransaction,
      amount: Number(newTransaction.amount.toString()),
      transactionDate: newTransaction.transactionDate.toISOString(),
      createdAt: newTransaction.createdAt.toISOString(),
    };

    return NextResponse.json(
      { message: "Transaction created successfully.", transaction: formattedTransaction },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Unable to save transaction. Please try again." },
      { status: 500 }
    );
  }
}
