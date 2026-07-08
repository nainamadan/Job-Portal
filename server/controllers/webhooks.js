import { Webhook } from "svix";
import User from "../models/User.js";

const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const payload = JSON.stringify(req.body);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const evt = whook.verify(payload, headers);

    const { data, type } = evt;

    switch (type) {
      case "user.created":
        await User.create({
          _id: data.id,
          name: data.first_name+" "+data.last_name,
          
          email: data.email_addresses[0].email_address,
          image: data.image_url,
          resume:''
        });
        break;

      case "user.updated":
        await User.findOneAndUpdate(
          { _id: data.id },
          {
              name: data.first_name+" "+data.last_name,
          
            email: data.email_addresses[0].email_address,
            image: data.image_url,
          }
        );
        break;

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