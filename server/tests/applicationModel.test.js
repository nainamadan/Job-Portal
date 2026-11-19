import { test } from "node:test";
import assert from "node:assert/strict";
import JobApplication from "../models/JobAppliaction.js";

// Regression: interviewDetails.type used to turn the whole interviewDetails field into a String,
// so accepting an application (which saves interview details) failed and no email was sent.
test("accepted application can store interview details", () => {
  assert.notEqual(JobApplication.schema.path("interviewDetails")?.instance, "String");
  assert.equal(JobApplication.schema.path("interviewDetails.type")?.instance, "String");

  const update = {
    $set: {
      status: "Accepted",
      interviewDetails: { date: "2026-12-01", time: "10:00 AM", type: "Online", link: "https://meet.example.test/x", location: "", notes: "Bring ID" },
    },
  };
  const query = JobApplication.findOneAndUpdate({}, update, { new: true, runValidators: true });
  assert.doesNotThrow(() => query._castUpdate(query.getUpdate()));

  const doc = new JobApplication({ userId: "u", companyId: "507f1f77bcf86cd799439011", jobId: "507f1f77bcf86cd799439013", ...update.$set });
  assert.equal(doc.validateSync(), undefined);
  assert.equal(doc.interviewDetails.type, "Online");
  assert.equal(doc.interviewDetails.date, "2026-12-01");
});
