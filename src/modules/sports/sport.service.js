const Sport = require("./sport.model");
const Coach = require("../coaches/coach.model");
const Player = require("../players/player.model");
const { ApiError } = require("../../utils/ApiError");
const {
  validateImageFile,
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} = require("../../utils/imageUpload");

class SportService {
  async getAllSports() {
    const sports = await Sport.find()
      .sort({ position: 1, createdAt: -1 })
      .populate("sport", "name")
      .lean();
    return sports.map((s) => ({
      ...s,
      bgImg: s.bgImg?.url || null,
    }));
  }

  async getSportByName(name) {
    const sportName = name.trim().toLowerCase();
    const sport = await Sport.findOne({ name: sportName }).lean();

    if (!sport) return null;

    let coaches = await Coach.find({ sport: sport._id })
      .sort({ position: 1, createdAt: -1 })
      .populate("sport", "name")
      .lean();
    coaches = coaches.map((c) => ({ ...c, image: c.image?.url || null }));

    let currentPlayers = await Player.find({
      sport: sport._id,
      type: "current",
    })
      .sort({ position: 1, createdAt: -1 })
      .lean();
    currentPlayers = currentPlayers.map((p) => ({
      ...p,
      image: p.image?.url || null,
    }));

    let formerPlayers = await Player.find({
      sport: sport._id,
      type: "former",
    })
      .sort({ position: 1, createdAt: -1 })
      .lean();
    formerPlayers = formerPlayers.map((p) => ({
      ...p,
      image: p.image?.url || null,
    }));

    return {
      ...sport,
      bgImg: sport.bgImg?.url || null,
      coaches,
      currentPlayers,
      formerPlayers,
    };
  }

  async createSport(payload, file) {
    let bgImgObj;

    if (file) {
      validateImageFile(file);
      const result = await uploadImageToCloudinary(file, {
        folder: "sportfuture/sports",
        publicId: `sport_${Date.now()}`,
      });
      bgImgObj = {
        url: result.url,
        public_id: result.public_id,
      };
    }

    try {
      const newSport = await Sport.create({
        ...payload,
        ...(bgImgObj && { bgImg: bgImgObj }),
      });
      return {
        ...newSport.toObject(),
        bgImg: newSport.bgImg?.url || null,
      };
    } catch (err) {
      if (bgImgObj?.public_id) {
        await deleteImageFromCloudinary(bgImgObj.public_id);
      }
      throw err;
    }
  }

  async updateSport(name, payload, file) {
    const sportName = name.trim().toLowerCase();
    const sport = await Sport.findOne({ name: sportName });

    if (!sport) {
      throw new ApiError("Sport not found", 404);
    }

    let bgImgObj = sport.bgImg;

    if (file) {
      validateImageFile(file);
      // Delete old image if it exists
      if (bgImgObj && bgImgObj.public_id) {
        await deleteImageFromCloudinary(bgImgObj.public_id);
      }

      const result = await uploadImageToCloudinary(file, {
        folder: "sportfuture/sports",
        publicId: `sport_${Date.now()}`,
      });

      bgImgObj = {
        url: result.url,
        public_id: result.public_id,
      };
    }

    const updatedSport = await Sport.findOneAndUpdate(
      { name: sportName },
      {
        ...payload,
        ...(bgImgObj && { bgImg: bgImgObj }),
      },
      { new: true },
    ).lean();

    return {
      ...updatedSport,
      bgImg: updatedSport.bgImg?.url || null,
    };
  }

  async reorderSports(items) {
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { position: item.position },
      },
    }));
    await Sport.bulkWrite(bulkOps);
  }

  // Admin routes for deleting sports will be added here
}

module.exports = new SportService();
