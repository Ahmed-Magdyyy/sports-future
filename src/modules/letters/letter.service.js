const Letter = require("./letter.model");
const { ApiError } = require("../../utils/ApiError");
const {
  validateImageFile,
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  uploadFileToCloudinary,
} = require("../../utils/imageUpload");
const path = require("path");

class LetterService {
  async getLetters(query = {}) {
    const { type, page, limit, startDate, endDate } = query;
    let filter = {};

    if (type) {
      filter.type = type;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    let lettersQuery = Letter.find(filter).sort({ date: -1, createdAt: -1 });

    if (page && limit) {
      const parsedPage = parseInt(page, 10);
      const parsedLimit = parseInt(limit, 10);
      const skip = (parsedPage - 1) * parsedLimit;

      const [letters, totalCount] = await Promise.all([
        lettersQuery.skip(skip).limit(parsedLimit).lean().exec(),
        Letter.countDocuments(filter),
      ]);

      return {
        letters,
        totalCount,
        totalPages: Math.ceil(totalCount / parsedLimit),
        currentPage: parsedPage,
      };
    }

    const letters = await lettersQuery.lean().exec();
    return {
      letters,
      totalCount: letters.length,
      totalPages: 1,
      currentPage: 1,
    };
  }

  async getLetterById(id) {
    const letter = await Letter.findById(id).lean();
    if (!letter) {
      throw new ApiError(`No letter found for this id: ${id}`, 404);
    }
    return letter;
  }

  async createLetter(payload, file) {
    let attachmentObj;

    // We can also allow non-image files if needed, 
    // but validateImageFile limits it to images.
    // Cloudinary supports PDFs and docs as raw or image depending on ResourceType.
    // For now, since utility is `validateImageFile`, we'll pass it if there's a file.
    if (file) {
      const ext = file.originalname ? path.extname(file.originalname) : "";
      const result = await uploadFileToCloudinary(file, {
        folder: "sportfuture/letters",
        publicId: `letter_${Date.now()}${ext}`,
      });
      attachmentObj = {
        url: result.url,
        public_id: result.public_id,
        resource_type: result.resource_type,
      };
    }

    try {
      const letter = await Letter.create({
        ...payload,
        attachment: attachmentObj || null,
      });
      return letter.toObject();
    } catch (err) {
      if (attachmentObj?.public_id) {
        await deleteImageFromCloudinary(attachmentObj.public_id, attachmentObj.resource_type);
      }
      throw err;
    }
  }

  async updateLetter(id, payload, file) {
    const letter = await Letter.findById(id);
    if (!letter) {
      throw new ApiError(`No letter found for this id: ${id}`, 404);
    }

    const { letterNumber, type, entity, subject, date, notes } = payload;
    if (letterNumber !== undefined) letter.letterNumber = letterNumber;
    if (type !== undefined) letter.type = type;
    if (entity !== undefined) letter.entity = entity;
    if (subject !== undefined) letter.subject = subject;
    if (date !== undefined) letter.date = date;
    if (notes !== undefined) letter.notes = notes;

    let newAttachmentObj;
    let oldPublicId;

    if (file) {
      oldPublicId = letter.attachment?.public_id;
      const ext = file.originalname ? path.extname(file.originalname) : "";
      const result = await uploadFileToCloudinary(file, {
        folder: "sportfuture/letters",
        publicId: `letter_${Date.now()}${ext}`,
      });
      newAttachmentObj = {
        url: result.url,
        public_id: result.public_id,
        resource_type: result.resource_type,
      };
      letter.attachment = newAttachmentObj;
    }

    try {
      const updated = await letter.save();

      if (oldPublicId && file) {
        await deleteImageFromCloudinary(oldPublicId, letter.attachment.resource_type || "image");
      }

      return updated.toObject();
    } catch (err) {
      if (newAttachmentObj?.public_id) {
        await deleteImageFromCloudinary(newAttachmentObj.public_id, newAttachmentObj.resource_type);
      }
      throw err;
    }
  }

  async deleteLetter(id) {
    const letter = await Letter.findById(id);
    if (!letter) {
      throw new ApiError(`No letter found for this id: ${id}`, 404);
    }

    if (letter.attachment?.public_id) {
      await deleteImageFromCloudinary(letter.attachment.public_id, letter.attachment.resource_type || "image");
    }

    await Letter.deleteOne({ _id: id });
    return letter.toObject();
  }
}

module.exports = new LetterService();
