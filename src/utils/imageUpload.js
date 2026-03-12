const { ApiError } = require("./ApiError");
const { cloudinary } = require("./cloudinary");
const sharp = require("sharp");

const DEFAULT_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function validateImageFile(
  file,
  {
    allowedMimeTypes = DEFAULT_ALLOWED_MIME_TYPES,
    maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  } = {},
) {
  if (!file) return;

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new ApiError(
      `Invalid image type. Allowed types: ${allowedMimeTypes.join(", ")}`,
      400,
    );
  }

  if (typeof file.size === "number" && file.size > maxSizeBytes) {
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    throw new ApiError(`Image is too large. Maximum size is ${maxMb} MB`, 400);
  }
}

async function uploadImageToCloudinary(file, { folder, publicId } = {}) {
  if (!file) return null;

  try {
    // Compress and resize the image buffer to avoid Cloudinary timeouts on big uploads
    // WebP compression will turn a 5MB image into around ~100-300KB
    const compressedBuffer = await sharp(file.buffer)
      .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    return new Promise((resolve, reject) => {
      const options = {
        folder,
        resource_type: "image",
      };
      if (publicId) {
        options.public_id = publicId;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            return reject(new ApiError("Failed to upload image", 500));
          }
          resolve({
            public_id: result.public_id,
            url: result.secure_url || result.url,
          });
        }
      );

      // Pass the compressed small buffer!
      uploadStream.end(compressedBuffer);
    });
  } catch (err) {
    console.error("Image Processing Error:", err);
    throw new ApiError("Failed to process image before upload", 500);
  }
}

async function deleteImageFromCloudinary(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary Delete Error:", err);
    // swallow cleanup errors so they don't break the main flow
  }
}

module.exports = {
  validateImageFile,
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
};
