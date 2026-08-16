import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";

export type PeriodOption =
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "LAST_3_MONTHS"
  | "THIS_YEAR"
  | "ALL_TIME";

export const VALID_PERIODS: PeriodOption[] = [
  "THIS_MONTH",
  "LAST_MONTH",
  "LAST_3_MONTHS",
  "THIS_YEAR",
  "ALL_TIME",
];

/**
 * Returns date range boundary for a given period matching dashboard date logic exactly.
 */
export function getDateRangeForPeriod(period?: string): { gte?: Date; lte?: Date } | null {
  const normalized = (period || "THIS_MONTH").toUpperCase() as PeriodOption;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  switch (normalized) {
    case "THIS_MONTH":
      return {
        gte: new Date(Date.UTC(currentYear, currentMonth, 1)),
        lte: new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)),
      };
    case "LAST_MONTH":
      return {
        gte: new Date(Date.UTC(currentYear, currentMonth - 1, 1)),
        lte: new Date(Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999)),
      };
    case "LAST_3_MONTHS":
      return {
        gte: new Date(Date.UTC(currentYear, currentMonth - 2, 1)),
        lte: new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)),
      };
    case "THIS_YEAR":
      return {
        gte: new Date(Date.UTC(currentYear, 0, 1)),
        lte: new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)),
      };
    case "ALL_TIME":
      return null;
    default:
      return {
        gte: new Date(Date.UTC(currentYear, currentMonth, 1)),
        lte: new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)),
      };
  }
}

/**
 * Finance Tool Definitions (AI Tool Call Schemas)
 * 
 * SECURITY REQUIREMENT:
 * `userId` is EXCLUDED from all tool definitions. The AI can only specify parameters
 * like period or limit. `userId` is strictly injected on the server from `session.user.id`.
 */
export const FINANCE_TOOL_DEFINITIONS = [
  {
    name: "getFinancialSummary",
    description: "Get total income, total expenses, net balance, and transaction count for the user for a specified time period.",
    parameters: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["THIS_MONTH", "LAST_MONTH", "LAST_3_MONTHS", "THIS_YEAR", "ALL_TIME"],
          description: "Time period for financial summary. Defaults to THIS_MONTH.",
        },
      },
      required: ["period"],
    },
  },
  {
    name: "getCategorySpending",
    description: "Get expense spending grouped by category for a specified time period.",
    parameters: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["THIS_MONTH", "LAST_MONTH", "LAST_3_MONTHS", "THIS_YEAR", "ALL_TIME"],
          description: "Time period for category breakdown. Defaults to THIS_MONTH.",
        },
      },
      required: ["period"],
    },
  },
  {
    name: "getRecentTransactions",
    description: "Get recent financial transactions for the user.",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "integer",
          description: "Number of recent transactions to return (1-20). Defaults to 5.",
        },
        type: {
          type: "string",
          enum: ["EXPENSE", "INCOME", "ALL"],
          description: "Filter transactions by type. Defaults to ALL.",
        },
        period: {
          type: "string",
          enum: ["THIS_MONTH", "LAST_MONTH", "LAST_3_MONTHS", "THIS_YEAR", "ALL_TIME"],
          description: "Optional time period filter.",
        },
      },
      required: ["limit"],
    },
  },
  {
    name: "comparePeriods",
    description: "Compare total income, total expenses, and balance between two time periods (e.g. current month vs last month).",
    parameters: {
      type: "object",
      properties: {
        currentPeriod: {
          type: "string",
          enum: ["THIS_MONTH", "LAST_MONTH", "LAST_3_MONTHS", "THIS_YEAR", "ALL_TIME"],
          description: "The primary time period to evaluate. Defaults to THIS_MONTH.",
        },
        previousPeriod: {
          type: "string",
          enum: ["THIS_MONTH", "LAST_MONTH", "LAST_3_MONTHS", "THIS_YEAR", "ALL_TIME"],
          description: "The baseline time period to compare against. Defaults to LAST_MONTH.",
        },
      },
      required: ["currentPeriod", "previousPeriod"],
    },
  },
];

export interface FinancialSummaryParams {
  period?: string;
}

export interface CategorySpendingParams {
  period?: string;
}

export interface RecentTransactionsParams {
  limit?: number;
  type?: "EXPENSE" | "INCOME" | "ALL";
  period?: string;
}

export interface ComparePeriodsParams {
  currentPeriod?: string;
  previousPeriod?: string;
  period1?: string;
  period2?: string;
}

/**
 * TOOL 1: getFinancialSummary
 */
export async function getFinancialSummary(
  userId: number,
  params: FinancialSummaryParams = {}
) {
  if (!userId || typeof userId !== "number" || isNaN(userId)) {
    throw new Error("Unauthorized: Valid authenticated user ID is required.");
  }

  const period: PeriodOption = VALID_PERIODS.includes(params.period as PeriodOption)
    ? (params.period as PeriodOption)
    : "THIS_MONTH";

  const dateRange = getDateRangeForPeriod(period);
  const whereClause: Prisma.TransactionWhereInput = { userId };

  if (dateRange) {
    whereClause.transactionDate = {
      gte: dateRange.gte,
      lte: dateRange.lte,
    };
  }

  const typeSums = await prisma.transaction.groupBy({
    by: ["type"],
    _sum: { amount: true },
    _count: { id: true },
    where: whereClause,
  });

  let income = 0;
  let expenses = 0;
  let transactionCount = 0;

  typeSums.forEach((item) => {
    const val = Number(item._sum.amount?.toString() || "0");
    const count = item._count.id || 0;
    transactionCount += count;

    if (item.type === "INCOME") {
      income += val;
    } else if (item.type === "EXPENSE") {
      expenses += val;
    }
  });

  const balance = income - expenses;

  return {
    period,
    income: Number(income.toFixed(2)),
    expenses: Number(expenses.toFixed(2)),
    balance: Number(balance.toFixed(2)),
    transactionCount,
    currency: "MYR",
  };
}

/**
 * TOOL 2: getCategorySpending
 */
export async function getCategorySpending(
  userId: number,
  params: CategorySpendingParams = {}
) {
  if (!userId || typeof userId !== "number" || isNaN(userId)) {
    throw new Error("Unauthorized: Valid authenticated user ID is required.");
  }

  const period: PeriodOption = VALID_PERIODS.includes(params.period as PeriodOption)
    ? (params.period as PeriodOption)
    : "THIS_MONTH";

  const dateRange = getDateRangeForPeriod(period);
  const whereClause: Prisma.TransactionWhereInput = {
    userId,
    type: "EXPENSE",
  };

  if (dateRange) {
    whereClause.transactionDate = {
      gte: dateRange.gte,
      lte: dateRange.lte,
    };
  }

  const categoryGroups = await prisma.transaction.groupBy({
    by: ["category"],
    _sum: { amount: true },
    where: whereClause,
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
  });

  let totalExpenses = 0;
  const rawCategories = categoryGroups.map((item) => {
    const amt = Number(item._sum.amount?.toString() || "0");
    totalExpenses += amt;
    return {
      category: item.category,
      amount: amt,
    };
  });

  const categories = rawCategories.map((c) => ({
    category: c.category,
    amount: Number(c.amount.toFixed(2)),
    percentage: totalExpenses > 0 ? Number(((c.amount / totalExpenses) * 100).toFixed(1)) : 0,
  }));

  categories.sort((a, b) => b.amount - a.amount);

  return {
    period,
    totalExpenses: Number(totalExpenses.toFixed(2)),
    categories,
    currency: "MYR",
  };
}

/**
 * TOOL 3: getRecentTransactions
 */
export async function getRecentTransactions(
  userId: number,
  params: RecentTransactionsParams = {}
) {
  if (!userId || typeof userId !== "number" || isNaN(userId)) {
    throw new Error("Unauthorized: Valid authenticated user ID is required.");
  }

  // Safe bounded limit: 1 to 20, default 5
  const limit = Math.min(Math.max(Number(params.limit) || 5, 1), 20);

  const whereClause: Prisma.TransactionWhereInput = { userId };

  if (params.type && params.type !== "ALL") {
    if (params.type === "INCOME" || params.type === "EXPENSE") {
      whereClause.type = params.type;
    }
  }

  if (params.period && VALID_PERIODS.includes(params.period as PeriodOption)) {
    const dateRange = getDateRangeForPeriod(params.period);
    if (dateRange) {
      whereClause.transactionDate = {
        gte: dateRange.gte,
        lte: dateRange.lte,
      };
    }
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    orderBy: [
      { transactionDate: "desc" },
      { createdAt: "desc" },
    ],
    take: limit,
    select: {
      id: true,
      type: true,
      amount: true,
      category: true,
      description: true,
      transactionDate: true,
    },
  });

  return {
    count: transactions.length,
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount.toString()),
      category: t.category,
      description: t.description,
      transactionDate: t.transactionDate.toISOString().split("T")[0],
    })),
    currency: "MYR",
  };
}

/**
 * TOOL 4: comparePeriods
 */
export async function comparePeriods(
  userId: number,
  params: ComparePeriodsParams = {}
) {
  if (!userId || typeof userId !== "number" || isNaN(userId)) {
    throw new Error("Unauthorized: Valid authenticated user ID is required.");
  }

  const currentPStr = params.currentPeriod || params.period1 || "THIS_MONTH";
  const previousPStr = params.previousPeriod || params.period2 || "LAST_MONTH";

  const currentPeriodKey: PeriodOption = VALID_PERIODS.includes(currentPStr as PeriodOption)
    ? (currentPStr as PeriodOption)
    : "THIS_MONTH";

  const previousPeriodKey: PeriodOption = VALID_PERIODS.includes(previousPStr as PeriodOption)
    ? (previousPStr as PeriodOption)
    : "LAST_MONTH";

  const [currentPeriodData, previousPeriodData] = await Promise.all([
    getFinancialSummary(userId, { period: currentPeriodKey }),
    getFinancialSummary(userId, { period: previousPeriodKey }),
  ]);

  const expenseDifference = Number((currentPeriodData.expenses - previousPeriodData.expenses).toFixed(2));
  const incomeDifference = Number((currentPeriodData.income - previousPeriodData.income).toFixed(2));

  let expensePercentageChange = 0;
  if (previousPeriodData.expenses > 0) {
    expensePercentageChange = Number(
      (((currentPeriodData.expenses - previousPeriodData.expenses) / previousPeriodData.expenses) * 100).toFixed(1)
    );
  } else if (currentPeriodData.expenses > 0) {
    expensePercentageChange = 100;
  }

  return {
    currentPeriod: currentPeriodData,
    previousPeriod: previousPeriodData,
    expenseDifference,
    expensePercentageChange,
    incomeDifference,
    spentMoreInCurrentPeriod: expenseDifference > 0,
    spentLessInCurrentPeriod: expenseDifference < 0,
    currency: "MYR",
  };
}

/**
 * Server-Side Tool Registry & Executor
 */
export async function executeFinanceTool(
  toolName: string,
  rawArgs: Record<string, unknown>,
  userId: number
): Promise<unknown> {
  if (!userId || typeof userId !== "number" || isNaN(userId)) {
    throw new Error("Unauthorized user session for tool execution.");
  }

  switch (toolName) {
    case "getFinancialSummary":
      return await getFinancialSummary(userId, rawArgs as FinancialSummaryParams);
    case "getCategorySpending":
      return await getCategorySpending(userId, rawArgs as CategorySpendingParams);
    case "getRecentTransactions":
      return await getRecentTransactions(userId, rawArgs as RecentTransactionsParams);
    case "comparePeriods":
      return await comparePeriods(userId, rawArgs as ComparePeriodsParams);
    default:
      throw new Error(`Tool "${toolName}" is not registered or allowed.`);
  }
}
