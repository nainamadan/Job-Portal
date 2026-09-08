import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloud name:", cloudinary.config().cloud_name);
console.log("API key:", cloudinary.config().api_key);
console.log("Secret exists:", !!cloudinary.config().api_secret);

try {
  const result = await cloudinary.uploader.upload(
    "./company_icon.png",
    {
      folder: "test",
    }
  );

  console.log("✅ UPLOAD SUCCESS");
  console.log(result.secure_url);
} catch (error) {
  console.log("❌ UPLOAD FAILED");
  console.log("Message:", error.message);
  console.log("HTTP:", error.http_code);
  console.log("Error:", error.error);
  console.dir(error, { depth: null });
}