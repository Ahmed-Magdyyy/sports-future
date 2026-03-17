const mongoose = require("mongoose");

const letterSchema = new mongoose.Schema(
  {
    letterNumber: { type: String, required: true, trim: true },
    type: { type: String, enum: ["صادر", "وارد"], required: true },
    entity: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    attachment: {
      public_id: { type: String },
      url: { type: String },
      resource_type: { type: String, default: "image" },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Letter", letterSchema);
