import express from "express";
import { getAuth } from "@clerk/express";
import Portfolio from "../models/Portfolio.js";
import { PortfolioError, validatePortfolio, importGithubProjects, githubUsername } from "../utils/portfolio.js";

const present = (doc) => {
  const { userId, __v, ...fields } = doc.toObject ? doc.toObject() : doc;
  void userId; void __v;
  return fields;
};
const fail = (res, error) => res.status(error instanceof PortfolioError ? error.status : 500).json({ success: false, message: error instanceof PortfolioError ? error.message : "Could not load or save your portfolio. Please try again." });
const conflict = (res) => res.status(409).json({ success: false, message: "A newer draft was saved in another tab. Reopen this page to load it before saving again. You can still download your current portfolio." });

export const createPortfolioRouter = ({ importProjects = importGithubProjects, now = Date.now } = {}) => {
  const router = express.Router();
  const attempts = new Map();
  router.use((req, res, next) => {
    let userId;
    try { userId = getAuth(req)?.userId; } catch { /* Supports the existing Clerk auth-object middleware. */ }
    userId ||= typeof req.auth === "object" ? req.auth?.userId : null;
    if (!userId) return res.status(401).json({ success: false, message: "Sign in to import GitHub projects or save a portfolio draft." });
    req.portfolioUserId = userId;
    next();
  });
  router.get("/mine", async (req, res) => {
    try {
      const portfolio = await Portfolio.findOne({ userId: req.portfolioUserId }).lean();
      res.json({ success: true, portfolio: portfolio ? present(portfolio) : null });
    } catch (error) { fail(res, error); }
  });
  router.put("/mine", async (req, res) => {
    try {
      const input = validatePortfolio(req.body);
      if (!Number.isSafeInteger(req.body.revision) || req.body.revision < 0) throw new PortfolioError("The draft version is missing. Reopen your saved draft and try again.");
      let portfolio;
      if (req.body.revision === 0) {
        try { portfolio = await Portfolio.create({ ...input, userId: req.portfolioUserId }); }
        catch (error) { if (error.code === 11000) return conflict(res); throw error; }
      } else {
        portfolio = await Portfolio.findOneAndUpdate({ userId: req.portfolioUserId, revision: req.body.revision }, { $set: input, $inc: { revision: 1 } }, { new: true, runValidators: true }).lean();
        if (!portfolio) return conflict(res);
      }
      res.json({ success: true, portfolio: present(portfolio) });
    } catch (error) { fail(res, error); }
  });
  router.get("/github/:username", async (req, res) => {
    try {
      const username = githubUsername(req.params.username);
      const time = now();
      for (const [id, state] of attempts) if (time - state.start >= 600000) attempts.delete(id);
      const state = attempts.get(req.portfolioUserId) || { start: time, count: 0 };
      if (state.count >= 5 || (!attempts.has(req.portfolioUserId) && attempts.size >= 10000)) {
        res.set("Retry-After", "600");
        throw new PortfolioError("You have imported several GitHub accounts. Please wait a few minutes before trying again.", 429);
      }
      state.count++; attempts.set(req.portfolioUserId, state);
      res.json({ success: true, ...await importProjects(username) });
    } catch (error) { fail(res, error); }
  });
  return router;
};
export default createPortfolioRouter();
