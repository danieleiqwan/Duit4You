export function formatCurrency(
  amount: number | string,
  type?: "INCOME" | "EXPENSE"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return "RM 0.00";
  }

  const formatted = Math.abs(num).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (type === "INCOME") {
    return `+RM${formatted}`;
  } else if (type === "EXPENSE") {
    return `-RM${formatted}`;
  }

  return `RM${formatted}`;
}
