import mongoose from "mongoose";
import SkillProof from "../models/SkillProof.js";
import JobApplication from "../models/JobAppliaction.js";
import { validateProof, validateReview, validRevision, presentProof, ProofInputError } from "../utils/skillProof.js";

const missing = (res) => res.status(404).json({ success: false, message: "Application or skill proof not found." });
const conflict = (res) => res.status(409).json({ success: false, message: "This proof changed. Refresh the vault and review the latest version before saving." });
const fail = (res, error) => res.status(error instanceof ProofInputError ? 400 : 500).json({
  success: false, message: error instanceof ProofInputError ? error.message : "Could not load or save the skill proof. Please try again.",
});
const owner = (req) => ({ _id: req.params.id, userId: req.proofUserId });
const applicant = (req) => JobApplication.findOne({ _id: req.params.applicationId, companyId: req.companyId }).select("userId").lean();

export const validateProofIds = (req, res, next) => {
  if ([req.params.id, req.params.applicationId].some((id) => id !== undefined && !mongoose.isObjectIdOrHexString(id))) {
    return res.status(400).json({ success: false, message: "Invalid skill proof or application address." });
  }
  next();
};

export const listMyProofs = async (req, res) => {
  try {
    const proofs = await SkillProof.find({ userId: req.proofUserId }).sort({ updatedAt: -1 }).lean();
    res.json({ success: true, proofs: proofs.map((proof) => presentProof(proof)) });
  } catch (error) { fail(res, error); }
};

export const createProof = async (req, res) => {
  try {
    const input = validateProof(req.body);
    const proof = await SkillProof.create({ ...input, userId: req.proofUserId });
    res.status(201).json({ success: true, proof: presentProof(proof) });
  } catch (error) { fail(res, error); }
};

export const updateProof = async (req, res) => {
  try {
    const input = validateProof(req.body);
    if (!validRevision(req.body.revision)) throw new ProofInputError("The proof version is missing. Refresh and try again.");
    // Content changes invalidate every review in the same atomic database update.
    const proof = await SkillProof.findOneAndUpdate({ ...owner(req), revision: req.body.revision }, {
      $set: { ...input, reviews: [] }, $inc: { revision: 1, __v: 1 },
    }, { new: true, runValidators: true }).lean();
    if (!proof) return await SkillProof.exists(owner(req)) ? conflict(res) : missing(res);
    res.json({ success: true, proof: presentProof(proof) });
  } catch (error) { fail(res, error); }
};

export const deleteProof = async (req, res) => {
  try {
    if (!validRevision(req.body?.revision)) throw new ProofInputError("The proof version is missing. Refresh and try again.");
    const proof = await SkillProof.findOneAndDelete({ ...owner(req), revision: req.body.revision });
    if (!proof) return await SkillProof.exists(owner(req)) ? conflict(res) : missing(res);
    res.json({ success: true });
  } catch (error) { fail(res, error); }
};

export const listApplicantProofs = async (req, res) => {
  try {
    const application = await applicant(req);
    if (!application) return missing(res);
    const proofs = await SkillProof.find({ userId: application.userId }).sort({ updatedAt: -1 }).lean();
    res.json({ success: true, proofs: proofs.map((proof) => presentProof(proof, req.companyId)) });
  } catch (error) { fail(res, error); }
};

export const reviewProof = async (req, res) => {
  try {
    const input = validateReview(req.body);
    if (!validRevision(req.body.revision)) throw new ProofInputError("The proof version is missing. Refresh and try again.");
    const application = await applicant(req);
    if (!application) return missing(res);
    // The candidate comes from an owned application, never from the submitted body.
    const filter = { _id: req.params.id, userId: application.userId };
    const proof = await SkillProof.findOne(filter).lean();
    if (!proof) return missing(res);
    if (proof.revision !== req.body.revision) return conflict(res);
    const reviews = (proof.reviews || []).filter((review) => String(review.companyId) !== String(req.companyId));
    reviews.push({ ...input, companyId: req.companyId, companyName: req.company.name || "Recruiter", reviewedAt: new Date() });
    // A version guard prevents simultaneous company reviews or candidate edits from overwriting each other.
    const updated = await SkillProof.findOneAndUpdate({ ...filter, revision: proof.revision, __v: proof.__v }, {
      $set: { reviews }, $inc: { __v: 1 },
    }, { new: true, runValidators: true }).lean();
    if (!updated) return conflict(res);
    res.json({ success: true, proof: presentProof(updated, req.companyId) });
  } catch (error) { fail(res, error); }
};
