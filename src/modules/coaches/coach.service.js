const Coach = require("./coach.model");
const { ApiError } = require("../../utils/ApiError");
const {
  validateImageFile,
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} = require("../../utils/imageUpload");

class CoachService {
  async getAllCoaches() {
    const coaches = await Coach.find().sort({ position: 1, createdAt: -1 }).populate("sport", "name").lean();
    return coaches.map((c) => ({
      ...c,
      image: c.image?.url || null,
    }));
  }

  async getCoachById(id) {
    const coach = await Coach.findById(id).populate("sport", "name").lean();
    if (!coach) {
      throw new ApiError(`No coach found for this id: ${id}`, 404);
    }
    return {
      ...coach,
      image: coach.image?.url || null,
    };
  }

  async getCoachesBySportId(sportId) {
    const coaches = await Coach.find({ sport: sportId }).sort({ position: 1, createdAt: -1 }).lean();
    return coaches.map((c) => ({
      ...c,
      image: c.image?.url || null,
    }));
  }

  async createCoach(payload, file) {
    let imageObj;

    if (file) {
      validateImageFile(file);
      const result = await uploadImageToCloudinary(file, {
        folder: "sportfuture/coaches",
        publicId: `coach_${Date.now()}`,
      });
      imageObj = {
        url: result.url,
        public_id: result.public_id,
      };
    } else {
      throw new ApiError("Image is required to create a coach", 400);
    }

    try {
      const coach = await Coach.create({
        ...payload,
        image: imageObj,
      });
      return {
        ...coach.toObject(),
        image: coach.image?.url || null,
      };
    } catch (err) {
      if (imageObj?.public_id) {
        await deleteImageFromCloudinary(imageObj.public_id);
      }
      throw err;
    }
  }

  async updateCoach(id, payload, file) {
    const coach = await Coach.findById(id);
    if (!coach) {
      throw new ApiError(`No coach found for this id: ${id}`, 404);
    }

    const { name, role, sport } = payload;
    if (name !== undefined) coach.name = name;
    if (role !== undefined) coach.role = role;
    if (sport !== undefined) coach.sport = sport;

    let newImageObj;
    let oldPublicId;

    if (file) {
      validateImageFile(file);
      oldPublicId = coach.image?.public_id;
      const result = await uploadImageToCloudinary(file, {
        folder: "sportfuture/coaches",
        publicId: `coach_${Date.now()}`,
      });
      newImageObj = {
        url: result.url,
        public_id: result.public_id,
      };
      coach.image = newImageObj;
    }

    try {
      const updated = await coach.save();

      if (oldPublicId) {
        await deleteImageFromCloudinary(oldPublicId);
      }

      return {
        ...updated.toObject(),
        image: updated.image?.url || null,
      };
    } catch (err) {
      if (newImageObj?.public_id) {
        await deleteImageFromCloudinary(newImageObj.public_id);
      }
      throw err;
    }
  }

  async deleteCoach(id) {
    const coach = await Coach.findById(id);
    if (!coach) {
      throw new ApiError(`No coach found for this id: ${id}`, 404);
    }

    if (coach.image?.public_id) {
      await deleteImageFromCloudinary(coach.image.public_id);
    }

    await Coach.deleteOne({ _id: id });
    return {
      ...coach.toObject(),
      image: coach.image?.url || null,
    };
  }
  async reorderCoaches(items) {
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { position: item.position },
      },
    }));
    await Coach.bulkWrite(bulkOps);
  }
}

module.exports = new CoachService();
