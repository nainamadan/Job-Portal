import Company from "../models/Company.js";
import Job from "../models/Job.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import generateToken from "../utils/generateToken.js";


// Register a new company
// export const registerCompany = async (req, res) => {
//   try {
//     console.log("Register API Hit");

//     const { name, email, password } = req.body;
//     const image = req.file;

//     console.log(req.body);
//     console.log(req.file);

//     // Check fields
//     if (!name || !email || !password || !image) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing Details",
//       });
//     }

//     // Company already exists
//     const companyExists = await Company.findOne({ email });

//     if (companyExists) {
//       return res.status(400).json({
//         success: false,
//         message: "Company already exists",
//       });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     console.log("Uploading image...");

//     // Upload image to Cloudinary
//     const uploadResult = await cloudinary.uploader.upload(image.path, {
//       folder: "companies",
//        resource_type: "image",
//   type: "upload",
//     });

//     console.log("UPLOAD SUCCESS:", uploadResult.secure_url);

//     // Save company
//     const company = await Company.create({
//       name,
//       email,
//       password: hashedPassword,
//       image: uploadResult.secure_url,
//     });

//     // Generate Token
//     const token = generateToken(company._id);

//     return res.status(201).json({
//       success: true,
//       message: "Company Registered Successfully",
//       token,
//       company: {
//         _id: company._id,
//         name: company.name,
//         email: company.email,
//         image: company.image,
//       },
//     });

//   } catch (error) {
//     console.log("FULL CLOUDINARY ERROR");
//     console.dir(error, { depth: null });
//     console.log("HTTP CODE:", error.http_code);
//     console.log("ERROR MESSAGE:", error.message);

//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// Register a new company
export const registerCompany = async (req, res) => {
  try {
    console.log("Register API Hit");

    const { name, email, password } = req.body;
    const image = req.file;

    console.log("Body:", req.body);
    console.log("Image:", req.file);

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing Details",
      });
    }

    // Check if company already exists
    const companyExists = await Company.findOne({ email });

    if (companyExists) {
      return res.status(400).json({
        success: false,
        message: "Company already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload image to Cloudinary or use fallback
    let imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

    if (image && image.path) {
      try {
        console.log("Uploading image to Cloudinary...");
        const uploadResult = await cloudinary.uploader.upload(image.path, {
          folder: "companies",
        });
        if (uploadResult && uploadResult.secure_url) {
          imageUrl = uploadResult.secure_url;
          console.log("UPLOAD SUCCESS:", imageUrl);
        }
      } catch (cldError) {
        console.error("Cloudinary upload failed, using fallback avatar:", cldError.message);
      }
    }

    // Create company
    const company = await Company.create({
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
    });

    // Generate JWT token
    const token = generateToken(company._id);

    // Send response
    return res.status(201).json({
      success: true,
      message: "Company Registered Successfully",
      token,
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
    });

  } catch (error) {
    console.error("========== REGISTER ERROR ==========");
    console.error("Message:", error.message);
    console.error("====================================");

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// Get logged-in company profile
// Login company
// post=>/api/company/login
// body raw json email and password
export const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // Find company by email
    // agr koi company hogi is email se toh vo company variable me aajegu
    const company = await Company.findOne({ email });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, company.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT Token
    const token = generateToken(company._id);

    // Success Response
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get logged-in company profile
// Get logged-in company profile
export const getCompanyData = async (req, res) => {
  try {
    const companyId = req.companyId;

    const company = await Company.findById(companyId).select("-password");

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      company,
    });

  } catch (error) {
    console.error("Get Company Data Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Post a new job
 export const postJob = async (req, res) => {
  try {
    // Get job details from body
    const { title, description, location, salary ,level,category} = req.body;

    // Get company ID from protectCompany middleware
    const companyId = req.companyId;

    // Check details
    console.log("Title:", title);
    console.log("Description:", description);
    console.log("Location:", location);
    console.log("Salary:", salary);
    console.log("Company ID:", companyId);

    // Create new Job
    const newJob = new Job({
      title,
      description,
      location,
      salary,
      companyId,
      date:Date.now(),
      level,
category,
    });

    // Save job
    await newJob.save();

    console.log("New Job:", newJob);

    return res.status(201).json({
      success: true,
      message: "Job Posted Successfully",
      job: newJob,
    });

  } catch (error) {
    console.error("Post Job Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all jobs posted by company
export const getCompanyPostedJobs = async (req, res) => {
  try {
    // Get the logged-in company's ID from protectCompany middleware
    const companyId = req.companyId;

    // Find all jobs posted by this company
    const jobs = await Job.find({ companyId });

    // Send the jobs in the response
    return res.status(200).json({
      success: true,
      jobs,
    });

  } catch (error) {
    console.error("Get Company Posted Jobs Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get applicants for a specific job
export const getJobApplicants = async (req, res) => {};
export const getCompanyJobApplicants = getJobApplicants;

// Change application status
export const changeJobApplicationStatus = async (req, res) => {};

// Change job visibility (active/inactive)
export const changeVisibility = async (req, res) => {
  try {
    // Get job ID from request body
    const { id } = req.body;

    // Get logged-in company ID from protectCompany middleware
    const companyId = req.companyId;

    // Find the job using job ID and company ID
    // This ensures the job belongs to the logged-in company
    const job = await Job.findOne({
      _id: id,
      companyId: companyId,
    });

    // If job does not exist or does not belong to this company
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or not authorized",
      });
    }

    // Change the visibility status
    if(companyId.toString() !== job.companyId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to change the visibility of this job",
      });
    }
    job.visible = !job.visible;

    // Save the updated job
    await job.save();

    // Send updated job in response
    return res.status(200).json({
      success: true,
      message: "Job visibility changed successfully",
      job,
    });

  } catch (error) {
    console.error("Change Visibility Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};