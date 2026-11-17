# Instructions for Codex

## Keep the project guide up to date

- Read `PROJECT_GUIDE.md` before changing this repository, then check the relevant source files. Source code is the source of truth.
- Whenever you add, edit, remove, or generate project code, update `PROJECT_GUIDE.md` in the same task before your final response. This includes changes to dependencies, configuration, scripts, and assets that affect how the project works.
- Explain changes in simple English for someone who does not write code. Explain what changed and why it matters. Use file paths when they help the reader find something.
- Update the existing overview, features, file map, setup instructions, and limitations when the change affects them. Do not only append a history entry while leaving the guide out of date.
- Add one entry per completed task at the top of the guide's change history. Include the actual date, what changed, why, the main files changed, and the checks performed. Clearly say when a check was not run or failed.
- Preserve older history entries. Do not invent earlier history or claim that untested features work.
- Never copy secrets, tokens, passwords, personal data, or `.env` values into documentation. Environment variable names are enough.
- For documentation-only work, update the guide when its content or maintenance process changes. Do not create repetitive entries for trivial wording fixes.
- In your final response, briefly confirm that the guide was updated. If you cannot update it, explain the concrete reason.

This is an instruction for Codex sessions working in this repository. It is not a background file watcher and does not update the guide after edits made by other tools or people.
