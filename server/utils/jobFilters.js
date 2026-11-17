import { normalizeSalary } from "./salary.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const scalar = (value, name) => {
  if (value === undefined) return "";
  if (typeof value !== "string" || value.length > 500) throw new Error(`Invalid ${name} filter.`);
  return value.trim();
};
const list = (value, name) => {
  if (value === undefined) return [];
  const values = Array.isArray(value) ? value : [value];
  if (values.length > 50) throw new Error(`Too many ${name} filters.`);
  return values.map((item) => scalar(item, name)).filter(Boolean);
};

export const buildJobFilter = (query = {}) => {
  const filter = { visible: true };
  for (const field of ["title", "location"]) {
    const value = scalar(query[field], field);
    if (value) filter[field] = { $regex: escapeRegex(value), $options: "i" };
  }
  const clauses = [];
  for (const [param, field] of [["categories", "category"], ["locations", "location"], ["levels", "level"]]) {
    const values = list(query[param], param);
    if (values.length) clauses.push({ [field]: { $in: values } });
  }
  const skills = scalar(query.skills, "skills").split(",").map((skill) => skill.trim()).filter(Boolean);
  // Older jobs describe skills in their description rather than a skills field.
  for (const skill of skills) {
    clauses.push({ $or: ["description", "title", "skills"].map((field) => ({
      [field]: { $regex: escapeRegex(skill), $options: "i" },
    })) });
  }
  const minText = scalar(query.minSalary, "minimum salary");
  const maxText = scalar(query.maxSalary, "maximum salary");
  const min = minText ? normalizeSalary(minText) : undefined;
  const max = maxText ? normalizeSalary(maxText) : undefined;
  if (min !== undefined && max !== undefined && min > max) {
    throw new Error("Minimum salary cannot be greater than maximum salary.");
  }
  if (min !== undefined || max !== undefined) {
    filter.salary = {};
    if (min !== undefined) filter.salary.$gte = min;
    if (max !== undefined) filter.salary.$lte = max;
  }
  if (clauses.length) filter.$and = clauses;
  return filter;
};
