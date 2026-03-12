const Player = require("./player.model");
const { ApiError } = require("../../utils/ApiError");
const {
  validateImageFile,
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} = require("../../utils/imageUpload");

class PlayerService {
  async getAllPlayers() {
    const players = await Player.find().sort({ position: 1, createdAt: -1 }).populate("sport", "name").lean();
    return players.map(p => ({
      ...p,
      image: p.image?.url || null
    }));
  }

  async getPlayerById(id) {
    const player = await Player.findById(id).populate("sport", "name").lean();
    if (!player) {
      throw new ApiError(`No player found for this id: ${id}`, 404);
    }
    return {
      ...player,
      image: player.image?.url || null
    };
  }

  async getPlayersBySportId(sportId, type = null) {
    const query = { sport: sportId };
    if (type) query.type = type;
    const players = await Player.find(query).sort({ position: 1, createdAt: -1 }).lean();
    return players.map(p => ({
      ...p,
      image: p.image?.url || null
    }));
  }

  async createPlayer(payload, file) {
    let imageObj;

    if (file) {
      validateImageFile(file);
      const result = await uploadImageToCloudinary(file, {
        folder: "sportfuture/players",
        publicId: `player_${Date.now()}`,
      });
      imageObj = {
        url: result.url,
        public_id: result.public_id,
      };
    } else {
      throw new ApiError("Image is required to create a player", 400);
    }

    try {
      const player = await Player.create({
        ...payload,
        image: imageObj,
      });
      return {
        ...player.toObject(),
        image: player.image?.url || null
      };
    } catch (err) {
      if (imageObj?.public_id) {
        await deleteImageFromCloudinary(imageObj.public_id);
      }
      throw err;
    }
  }

  async updatePlayer(id, payload, file) {
    const player = await Player.findById(id);
    if (!player) {
      throw new ApiError(`No player found for this id: ${id}`, 404);
    }

    const { name, type, sport } = payload;
    if (name !== undefined) player.name = name;
    if (type !== undefined) player.type = type;
    if (sport !== undefined) player.sport = sport;

    let newImageObj;
    let oldPublicId;

    if (file) {
      validateImageFile(file);
      oldPublicId = player.image?.public_id;
      const result = await uploadImageToCloudinary(file, {
        folder: "sportfuture/players",
        publicId: `player_${Date.now()}`,
      });
      newImageObj = {
        url: result.url,
        public_id: result.public_id,
      };
      player.image = newImageObj;
    }

    try {
      const updated = await player.save();

      if (oldPublicId) {
        await deleteImageFromCloudinary(oldPublicId);
      }

      return {
        ...updated.toObject(),
        image: updated.image?.url || null
      };
    } catch (err) {
      if (newImageObj?.public_id) {
        await deleteImageFromCloudinary(newImageObj.public_id);
      }
      throw err;
    }
  }

  async deletePlayer(id) {
    const player = await Player.findById(id);
    if (!player) {
      throw new ApiError(`No player found for this id: ${id}`, 404);
    }

    if (player.image?.public_id) {
      await deleteImageFromCloudinary(player.image.public_id);
    }

    await Player.deleteOne({ _id: id });
    return {
      ...player.toObject(),
      image: player.image?.url || null
    };
  }
  async reorderPlayers(items) {
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { position: item.position },
      },
    }));
    await Player.bulkWrite(bulkOps);
  }
}

module.exports = new PlayerService();
