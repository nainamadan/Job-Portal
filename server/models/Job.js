// import mongoose from "mongoose";

// const jobSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     description: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     location: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     category: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     level: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     salary: {
//       type: Number,
//       required: true,
//     },

//     date: {
//       type: Date,
//       default: Date.now,
//     },

//     visible: {
//       type: Boolean,
//       default: true,
//     },

//     companyId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Company",
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Job = mongoose.model("Job", jobSchema);

// export default Job;




import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    level: {
      type: String,
      required: true,
      trim: true,
    },

    salary: {
      type: Number,
      required: true,
    },

    // Application duration selected by the company
    applicationDurationDays: {
      type: Number,
      required: true,
      enum: [7, 15, 30, 45, 60],
      default: 15,
    },

    // Final date to apply
    applicationDeadline: {
      type: Date,
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    visible: {
      type: Boolean,
      default: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
