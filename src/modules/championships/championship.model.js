const mongoose = require("mongoose");

const championshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
    },
    rival: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // e.g., "5:00 PM"
      required: true,
    },
    endTime: {
      type: String, // e.g., "9:00 PM"
      required: true,
    },
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coach",
      required: true,
    },
    image: {
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

module.exports = mongoose.model("Championship", championshipSchema);
