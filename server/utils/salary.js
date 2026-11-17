// A plain number keeps the existing contract: lakhs of INR per year (LPA).
export const normalizeSalary = (value, unit = "LPA") => {
  if (!["string", "number"].includes(typeof value)) throw new Error("Salary must be a number or formatted salary string.");
  if (!["LPA", "INR"].includes(String(unit).toUpperCase())) {
    throw new Error("Salary unit must be LPA or annual INR.");
  }
  const text = String(value ?? "").trim();
  const match = text.match(/^(₹\s*|INR\s*)?([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)\s*(LPA|LAKHS?|INR)?$/i);
  if (!match) {
    throw new Error("Enter a valid salary in LPA, or an explicitly marked annual INR amount.");
  }
  if (match[2].includes(",") && !/^(?:\d{1,3}(?:,\d{3})+|\d{1,2}(?:,\d{2})*,\d{3})(?:\.\d+)?$/.test(match[2])) {
    throw new Error("Use valid Indian or international digit grouping in the salary.");
  }
  const inRupees = !/LPA|LAKH/i.test(match[3] || "") && (match[1] || /^INR$/i.test(match[3] || "") ||
    (!match[3] && String(unit).toUpperCase() === "INR"));
  const amount = Number(match[2].replaceAll(",", "")) / (inRupees ? 100000 : 1);
  if (!Number.isFinite(amount) || amount < 0 || amount > Number.MAX_SAFE_INTEGER / 100000) {
    throw new Error("Salary must be a finite, non-negative amount.");
  }
  return Math.round(amount * 100000) / 100000;
};
