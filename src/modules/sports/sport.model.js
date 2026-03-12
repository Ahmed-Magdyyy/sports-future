const mongoose = require("mongoose");

const sportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    heroTitle: {
      type: String,
      required: true,
    },
    aboutTitle: {
      type: String,
      required: true,
    },
    aboutText: {
      type: String,
      required: true,
    },
    bgImg: {
      public_id: { type: String },
      url: { type: String },
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Sport", sportSchema);
