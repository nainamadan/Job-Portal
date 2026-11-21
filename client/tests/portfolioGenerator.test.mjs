import { test } from "node:test";
import assert from "node:assert/strict";
import { EMPTY_PORTFOLIO, buildPortfolioHtml, mergeResumeIntoPortfolio, parseGithubUsername, safePortfolioUrl, portfolioFilename } from "../src/utils/portfolioGenerator.js";

test("resume details fill empty portfolio fields while preserving edits and source content", () => {
  const old = { ...EMPTY_PORTFOLIO, name: "My chosen name", summary: "My own summary", skills: ["SQL"] };
  const merged = mergeResumeIntoPortfolio(old, {
    name: "Resume Name", email: "candidate@example.test", summary: "Different summary", skills: "React, JavaScript",
    degree: "B.Tech", institution: "Example College", graduationYear: "2027", projects: "A job portal I built.",
    github: "github.com/example-user", linkedin: "javascript:alert(1)",
  });
  assert.equal(merged.name, old.name);
  assert.equal(merged.summary, old.summary);
  assert.deepEqual(merged.skills, ["SQL"]);
  assert.equal(merged.email, "candidate@example.test");
  assert.equal(merged.education, "B.Tech · Example College · 2027");
  assert.equal(merged.resumeProjects, "A job portal I built.");
  assert.equal(merged.github, "https://github.com/example-user");
  assert.equal(merged.linkedin, "");
  assert.equal(old.email, "", "does not mutate the existing draft");
});

test("portfolio links, GitHub names and download filenames are constrained", () => {
  assert.equal(parseGithubUsername(" https://github.com/example-user/ "), "example-user");
  assert.equal(parseGithubUsername("example-user"), "example-user");
  for (const value of ["https://evil.test/example", "https://github.com/example/repo", "https://github.com/example?tab=repositories", "../admin", "-invalid", "a--b", "https://github.com@evil.test/person"]) assert.throws(() => parseGithubUsername(value));
  for (const value of ["javascript:alert(1)", "data:text/html,evil", "http://example.test", "https://user:password@example.test", "https://127.0.0.1/", "https://[::1]/"]) assert.equal(safePortfolioUrl(value), "");
  assert.equal(portfolioFilename("Ada <Lovelace> / ../"), "ada-lovelace-portfolio.html");
});

test("generated websites escape untrusted content, omit unsafe links and embed an optional photo", () => {
  const photo = "data:image/jpeg;base64,/9j/AA==";
  const html = buildPortfolioHtml({ ...EMPTY_PORTFOLIO, name: 'Ada <script>alert(1)</script>', headline: 'Developer "onload="alert(2)',
    summary: '<img src=x onerror=alert(3)>', email: "ada@example.test", photo, theme: "midnight", accent: 'red; background:url(https://evil.test)',
    skills: ["React", "<svg onload=alert(4)>"], experience: "Built a real project.",
    projects: [{ title: "<iframe src=evil>", description: "A & B", sourceUrl: "javascript:alert(5)", demoUrl: "https://example.test/demo", language: "JavaScript" }],
  });
  assert.ok(html.startsWith("<!doctype html>"));
  assert.match(html, /name="viewport"/);
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /&lt;img src=x onerror=alert\(3\)&gt;/);
  assert.doesNotMatch(html, /<script|<iframe|<svg|href="javascript:|url\(https:\/\/evil/);
  assert.match(html, /href="https:\/\/example.test\/demo"/);
  assert.match(html, /src="data:image\/jpeg;base64,\/9j\/AA=="/);
  assert.match(html, /Built a real project\./);
  const noPhoto = buildPortfolioHtml({ ...EMPTY_PORTFOLIO, name: "Ada Lovelace", photo: 'data:image/svg+xml,<svg onload=alert(1)>' });
  assert.doesNotMatch(noPhoto, /<img|data:image\/svg/);
  assert.match(noPhoto, /aria-hidden="true">AL<\/div>/);
  assert.doesNotMatch(noPhoto, /id="education"|id="experience"|id="contact"/);
});
