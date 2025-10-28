export function parseBudgetNear(budgetInr?: number | null): { maxPrice?: number; softCeil?: number } {
  if (!budgetInr || budgetInr <= 0) return {};
  const maxPrice = Math.round(budgetInr);
  const softCeil = Math.round(budgetInr * 1.1); // allow 10% wiggle room
  return { maxPrice, softCeil };
}


