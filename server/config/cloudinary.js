const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

/*
  =========================================
  CLOUDINARY CONFIG

  Requires these vars in server/.env:
    CLOUDINARY_CLOUD_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=
  =========================================
*/

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/*
  Storage engine used by multer. Every uploaded
  file is streamed straight to Cloudinary — it
  never touches your server's disk or MongoDB.
*/
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "wanderly/reviews",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 1600, height: 1600, crop: "limit" },
    ],
  },
});

/*
  Multer instance for review/trip image uploads.
  Accepts up to 6 images per request, 5MB each.
*/
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 6,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
});

module.exports = { cloudinary, upload };
