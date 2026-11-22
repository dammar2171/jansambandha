export function rs(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "Not set";
  return `Rs ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}
