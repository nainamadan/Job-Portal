import jwt from "jsonwebtoken";
import Company from "../models/Company.js";
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please login again.",
      });
    }

    const actualToken = token.split(" ")[1];

    const decoded = jwt.verify(
      actualToken,
      process.env.JWT_SECRET
    );

    req.companyId = decoded.id;

    next();

  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
export const protectCompany = async (req, res, next) => {
  try {
    // Get token from headers (supports 'token' header or 'authorization: Bearer <token>')
    let token = req.headers.token;
    if (!token && req.headers.authorization) {
      if (req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      } else {
        token = req.headers.authorization;
      }
    }

    // Token nahi mila
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find company using decoded ID
    const company = await Company.findById(decoded.id).select("-password");

    // Company nahi mili
    if (!company) {
      return res.status(401).json({
        success: false,
        message: "Company not found",
      });
    }

    // Company ko request mein store kar do
    req.company = company;
    req.companyId = company._id;

    // Next middleware/controller
    next();

  } catch (error) {
    console.error("Protect Company Error:", error);

    return res.status(401).json({
      success: false,
      message: "Not Authorized",
    });
  }
};
export default authMiddleware;