import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_PORTFOLIO } from "../src/utils/portfolioGenerator.js";
import { portfolioServiceMessage, readPortfolioDraftResponse } from "../src/utils/portfolioApi.js";

test("an empty portfolio is accepted only when the API explicitly confirms it", () => {
  assert.equal(readPortfolioDraftResponse({ success: true, portfolio: null }), null);
  for (const value of ["<!DOCTYPE html><p>Cannot GET /api/portfolios/mine</p>", { success: true }, { success: false, portfolio: null }, null, { portfolio: null }]) {
    assert.throws(() => readPortfolioDraftResponse(value), /unexpected response/);
  }
});

test("saved portfolio responses validate content and versions without carrying private or unrelated fields", () => {
  const saved = { ...EMPTY_PORTFOLIO, name: "Saved candidate", revision: 3, userId: "private-owner", __v: 8, projects: [{ id: "p1", title: "A project", userId: "untrusted" }] };
  const result = readPortfolioDraftResponse({ success: true, portfolio: saved });
  assert.equal(result.name, "Saved candidate");
  assert.equal(result.revision, 3);
  assert.equal(result.userId, undefined);
  assert.equal(result.__v, undefined);
  assert.equal(result.projects[0].userId, undefined);
  assert.equal(result.projects[0].description, "");
  for (const changes of [{ revision: 0 }, { revision: "3" }, { skills: "React" }, { skills: [{}] }, { projects: [{}] }, { projects: [{ id: "p1", title: "A", description: {} }] }, { name: {} }]) {
    assert.throws(() => readPortfolioDraftResponse({ success: true, portfolio: { ...saved, ...changes } }), /unexpected response/);
  }
});

test("missing routes explain the service problem while real GitHub and sign-in errors are preserved", () => {
  const missingRoute = { isAxiosError: true, message: "Request failed with status code 404", response: { status: 404, data: "Cannot GET /api/portfolios/mine" } };
  assert.match(portfolioServiceMessage(missingRoute), /still edit, add a photo and download/);
  assert.doesNotMatch(portfolioServiceMessage(missingRoute), /status code 404|Cannot GET/);
  assert.match(portfolioServiceMessage(missingRoute, "github"), /add projects manually/);
  assert.equal(portfolioServiceMessage({ response: { status: 404, data: { message: "GitHub user not found." } } }, "github"), "GitHub user not found.");
  assert.equal(portfolioServiceMessage({ response: { status: 401, data: { message: "Please sign in again." } } }), "Please sign in again.");
  assert.match(portfolioServiceMessage({ isAxiosError: true, code: "ECONNABORTED", message: "timeout" }), /still build and download/);
});
