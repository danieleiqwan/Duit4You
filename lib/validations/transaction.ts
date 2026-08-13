import { isValidCategory } from "@/lib/categories";

export interface TransactionInput {
  type: string;
  amount: number | string;
  category: string;
  description?: string | null;
  transactionDate: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  data?: {
    type: "INCOME" | "EXPENSE";
    amount: number;
    category: string;
    description: string | null;
    transactionDate: Date;
  };
}

export function validateTransactionInput(input: Partial<TransactionInput>): ValidationResult {
  const errors: Record<string, string> = {};

  // 1. Validate Type
  const rawType = input.type ? String(input.type).trim().toUpperCase() : "";
  if (!rawType || (rawType !== "INCOME" && rawType !== "EXPENSE")) {
    errors.type = "Transaction type must be either INCOME or EXPENSE.";
  }

  // 2. Validate Amount
  let numericAmount: number | undefined;
  if (input.amount === undefined || input.amount === null || String(input.amount).trim() === "") {
    errors.amount = "Amount is required.";
  } else {
    const rawAmountStr = String(input.amount).trim();
    // Validate format: positive number with up to 2 decimal places
    const amountRegex = /^\d+(\.\d{1,2})?$/;
    if (!amountRegex.test(rawAmountStr)) {
      errors.amount = "Amount must be a valid positive number with up to 2 decimal places.";
    } else {
      numericAmount = parseFloat(rawAmountStr);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        errors.amount = "Amount must be greater than zero.";
      }
    }
  }

  // 3. Validate Category
  const category = input.category ? String(input.category).trim() : "";
  if (!category) {
    errors.category = "Category is required.";
  } else if (rawType === "INCOME" || rawType === "EXPENSE") {
    if (!isValidCategory(category, rawType as "INCOME" | "EXPENSE")) {
      errors.category = `Invalid category '${category}' for ${rawType}.`;
    }
  }

  // 4. Validate Description
  let cleanDescription: string | null = null;
  if (input.description !== undefined && input.description !== null && typeof input.description === "string") {
    const trimmed = input.description.trim();
    if (trimmed.length > 255) {
      errors.description = "Description cannot exceed 255 characters.";
    } else if (trimmed.length > 0) {
      cleanDescription = trimmed;
    }
  }

  // 5. Validate Date
  let dateObj: Date | undefined;
  if (!input.transactionDate || typeof input.transactionDate !== "string" || input.transactionDate.trim() === "") {
    errors.transactionDate = "Transaction date is required.";
  } else {
    const dateStr = input.transactionDate.trim().split("T")[0];
    const parsedDate = new Date(`${dateStr}T00:00:00.000Z`);
    if (isNaN(parsedDate.getTime())) {
      errors.transactionDate = "Invalid transaction date.";
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const todayStr = `${year}-${month}-${day}`;
      const todayDate = new Date(`${todayStr}T00:00:00.000Z`);

      if (parsedDate.getTime() > todayDate.getTime()) {
        errors.transactionDate = "Transaction date cannot be in the future.";
      } else {
        dateObj = parsedDate;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    data: {
      type: rawType as "INCOME" | "EXPENSE",
      amount: numericAmount!,
      category,
      description: cleanDescription,
      transactionDate: dateObj!,
    },
  };
}
