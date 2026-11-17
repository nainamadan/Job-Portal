import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSalary } from "../utils/salary.js";
import { buildJobFilter } from "../utils/jobFilters.js";
import Job from "../models/Job.js";

test("salary values normalize to LPA without guessing a unit from their size", () => {
  for (const input of [10, "10", "10 LPA", "10 lakhs", "₹10 LPA", "INR 10,00,000", "1000000 INR", "₹1,000,000"]) {
    assert.equal(normalizeSalary(input), 10, String(input));
  }
  assert.equal(normalizeSalary(1000000, "INR"), 10);
  assert.equal(normalizeSalary("12.75 LPA"), 12.75);
  assert.equal(normalizeSalary(82000), 82000); // Existing numbers retain their meaning.
  for (const input of [null, undefined, "", -1, "NaN", Infinity, "10-20 LPA", "20 USD", "1,2 INR", [10], {}]) {
    assert.throws(() => normalizeSalary(input));
  }
  assert.throws(() => normalizeSalary(10, "USD"));
});

test("job model stores formatted salaries as numeric LPA", async () => {
  const job = new Job({ salary: "INR 12,50,000" });
  assert.equal(job.salary, 12.5);
  await assert.rejects(new Job({ salary: -1 }).validate(), (error) => Boolean(error.errors.salary));
});

test("salary filter is inclusive, supports either bound, zero, and clearing", () => {
  assert.deepEqual(buildJobFilter({ minSalary: "10", maxSalary: "20" }), { visible: true, salary: { $gte: 10, $lte: 20 } });
  assert.deepEqual(buildJobFilter({ minSalary: "10" }).salary, { $gte: 10 });
  assert.deepEqual(buildJobFilter({ maxSalary: "20" }).salary, { $lte: 20 });
  assert.deepEqual(buildJobFilter({ minSalary: "0", maxSalary: "0" }).salary, { $gte: 0, $lte: 0 });
  assert.deepEqual(buildJobFilter({ minSalary: "", maxSalary: "" }), { visible: true });
  const range = buildJobFilter({ minSalary: "10", maxSalary: "20" }).salary;
  assert.deepEqual([9.99, 10, 15, 20, 20.01].filter((salary) => salary >= range.$gte && salary <= range.$lte), [10, 15, 20]);
});

test("salary works with title, location, category, experience and every selected skill", () => {
  const filter = buildJobFilter({ title: "C++", location: "Remote", categories: ["Programming", "Data"],
    locations: "Bangalore", levels: "1-3 Years", skills: "React, Node.js", minSalary: "10.5", maxSalary: "20" });
  assert.equal(filter.title.$regex, "C\\+\\+");
  assert.equal(filter.location.$regex, "Remote");
  assert.deepEqual(filter.salary, { $gte: 10.5, $lte: 20 });
  assert.deepEqual(filter.$and.slice(0, 3), [
    { category: { $in: ["Programming", "Data"] } },
    { location: { $in: ["Bangalore"] } },
    { level: { $in: ["1-3 Years"] } },
  ]);
  assert.equal(filter.$and.length, 5);
  assert.equal(filter.$and[4].$or[0].description.$regex, "Node\\.js");
});

test("invalid ranges and query objects cannot reach the database", () => {
  for (const query of [{ minSalary: "20", maxSalary: "10" }, { minSalary: "-1" },
    { maxSalary: "Infinity" }, { minSalary: ["10", "20"] }, { title: { $ne: "" } },
    { categories: [{ $ne: "" }] }, { skills: ["React"] }]) {
    assert.throws(() => buildJobFilter(query));
  }
});
