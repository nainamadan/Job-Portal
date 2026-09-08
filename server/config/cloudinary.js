// import { v2 as cloudinary } from "cloudinary";

// const connectClodinary = async () => {
//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//   });

//   console.log("Cloudinary Connected");
// };

// export { cloudinary };
// export default connectClodinary;




import { v2 as cloudinary } from "cloudinary";

// const connectCloudinary = () => {
//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//   });

//   console.log("Cloudinary Connected");
// };
const connectCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const config = cloudinary.config();

  console.log("========== CLOUDINARY CONFIG ==========");
  console.log("Cloud Name:", config.cloud_name);
  console.log("API Key:", config.api_key);
  console.log("Secret Exists:", !!config.api_secret);
  console.log("=======================================");
};


export { cloudinary };

export default connectCloudinary;