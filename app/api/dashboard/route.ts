import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
    const period = searchParams.get("period") || "THIS_MONTH";

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const dateWhere: Prisma.TransactionWhereInput = {};

    if (period === "THIS_MONTH") {
      dateWhere.transactionDate = {
        gte: new Date(Date.UTC(currentYear, currentMonth, 1)),
        lte: new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)),
      };
    } else if (period === "LAST_MONTH") {
      dateWhere.transactionDate = {
        gte: new Date(Date.UTC(currentYear, currentMonth - 1, 1)),
        lte: new Date(Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999)),
      };
    } else if (period === "LAST_3_MONTHS") {
      dateWhere.transactionDate = {
        gte: new Date(Date.UTC(currentYear, currentMonth - 2, 1)),
        lte: new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)),
      };
    } else if (period === "THIS_YEAR") {
      dateWhere.transactionDate = {
        gte: new Date(Date.UTC(currentYear, 0, 1)),
        lte: new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)),
      };
    }
    // ALL_TIME has no date filters

    const baseWhere: Prisma.TransactionWhereInput = {
      userId,
      ...dateWhere,
    };

    // Execute aggregated queries concurrently
    const [
      totalCountAllTime,
      typeSums,
      categoryGroups,
      recentTransactionsRaw,
      periodExpenseTransactions,
    ] = await Promise.all([
      // 1. Check lifetime user transactions
      prisma.transaction.count({
        where: { userId },
      }),

      // 2. Sum income and expenses for selected period
      prisma.transaction.groupBy({
        by: ["type"],
        _sum: { amount: true },
        where: baseWhere,
      }),

      // 3. Group expenses by category for selected period
      prisma.transaction.groupBy({
        by: ["category"],
        _sum: { amount: true },
        where: {
          ...baseWhere,
          type: "EXPENSE",
        },
        orderBy: {
          _sum: {
            amount: "desc",
          },
        },
      }),

      // 4. Fetch 5 latest transactions for selected period
      prisma.transaction.findMany({
        where: baseWhere,
        orderBy: [
          { transactionDate: "desc" },
          { createdAt: "desc" },
        ],
        take: 5,
      }),

      // 5. Fetch expense transactions in selected period for monthly trend aggregation
      prisma.transaction.findMany({
        where: {
          ...baseWhere,
          type: "EXPENSE",
        },
        select: {
          amount: true,
          transactionDate: true,
        },
        orderBy: {
          transactionDate: "asc",
        },
      }),
    ]);

    // Parse Income, Expense, Balance
    let totalIncome = 0;
    let totalExpenses = 0;

    typeSums.forEach((item) => {
      const val = Number(item._sum.amount?.toString() || "0");
      if (item.type === "INCOME") {
        totalIncome += val;
      } else if (item.type === "EXPENSE") {
        totalExpenses += val;
      }
    });

    const balance = totalIncome - totalExpenses;

    // Format Category Breakdown
    const categoryBreakdown = categoryGroups.map((cat) => {
      const amount = Number(cat._sum.amount?.toString() || "0");
      const percentage = totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0;
      return {
        category: cat.category,
        amount,
        percentage,
      };
    });

    // Format Monthly Spending Trend
    const monthMap: Record<string, number> = {};
    periodExpenseTransactions.forEach((tx) => {
      const d = tx.transactionDate;
      const monthKey = d.toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
      const amt = Number(tx.amount.toString());
      monthMap[monthKey] = (monthMap[monthKey] || 0) + amt;
    });

    const monthlyTrend = Object.keys(monthMap).map((month) => ({
      month,
      expenses: monthMap[month],
    }));

    // Format Recent Transactions
    const recentTransactions = recentTransactionsRaw.map((t) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount.toString()),
      category: t.category,
      description: t.description,
      transactionDate: t.transactionDate.toISOString(),
      createdAt: t.createdAt.toISOString(),
    }));

    return NextResponse.json(
      {
        hasAnyTransactions: totalCountAllTime > 0,
        period,
        summary: {
          income: totalIncome,
          expenses: totalExpenses,
          balance,
        },
        categoryBreakdown,
        monthlyTrend,
        recentTransactions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating dashboard analytics:", error);
    return NextResponse.json(
      { error: "Unable to load financial data. Please try again." },
      { status: 500 }
    );
  }
}
