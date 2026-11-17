import { Webhook } from "svix";
import User from "../models/User.js";

const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const payload = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const evt = whook.verify(payload, headers);

    const { data, type } = evt;

    switch (type) {
      case "user.created":
      case "user.updated": {
        const primaryEmail = data.email_addresses?.find((email) => email.id === data.primary_email_address_id);
        if (!primaryEmail?.email_address) throw new Error("Primary account email is missing.");
        await User.findOneAndUpdate(
          { _id: data.id },
          {
            $set: {
              name: [data.first_name, data.last_name].filter(Boolean).join(" ") || data.username || "Applicant",
              email: primaryEmail.email_address,
              image: data.image_url || "",
            },
            $setOnInsert: { resume: "", savedJobs: [] },
          },
          { upsert: true, new: true, runValidators: true }
        );
        break;
      }

      case "user.deleted":
        await User.findOneAndDelete({
          _id: data.id,
        });
        break;

      default:
        console.log("Unhandled Event:", type);
    }

    return res.status(200).json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    console.log(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export default clerkWebhooks;
