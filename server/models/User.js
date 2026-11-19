import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    

    email: {
      type: String,
      required: true,
      unique: true,
    },

    image: {
      type: String,
      default: "",
    },

    resume: {
      type: String,
      default: "",
    },

    savedJobs: [
      {
        type: String,
      },
    ],

    // What kind of jobs this person wants new-job emails about (see utils/jobAlertMatcher.js).
    jobPreferences: {
      emailAlerts: { type: Boolean, default: true },
      roles: [{ type: String }], // categories or job titles, e.g. "Programming", "Frontend Developer"
      skills: [{ type: String }],
      locations: [{ type: String }],
      levels: [{ type: String }],
    },


    // role: {
    //   type: String,
    //   enum: ["user", "recruiter"],
    //   default: "user",
    // },

    // skills: [
    //   {
    //     type: String,
    //   },
    // ],

    // location: {
    //   type: String,
    //   default: "",
    // },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;