// Decode locally and re-encode: the uploaded original and its metadata are never sent to the server.
export const preparePortfolioPhoto = async (file) => {
  if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Choose a JPEG, PNG or WebP image.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Choose an image under 5MB.");
  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = () => reject(new Error("This image could not be read. Choose another file.")); image.src = source; });
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 40000000) throw new Error("Choose an image smaller than 40 megapixels.");
    const scale = Math.min(1, 640 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare the photo. Try another browser.");
    context.fillStyle = "#ffffff"; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const photo = canvas.toDataURL("image/jpeg", 0.85);
    if (photo.length > 700000) throw new Error("The processed image is too large. Try a smaller photo.");
    return photo;
  } finally { URL.revokeObjectURL(source); }
};
