const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: "dtyqscfja",
  api_key: "115511954198638",
  api_secret: "wCVNueaugazJHliNe6RhJS1sSYo",
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });

    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary: " + error.message);
  }
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };
