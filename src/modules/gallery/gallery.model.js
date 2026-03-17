const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    public_id: {
      type: String,
    },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      default: null,
    },
    isGeneral: {
      type: Boolean,
      default: true,
    },
    showInHome: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Gallery = mongoose.model("Gallery", gallerySchema);

module.exports = Gallery;
