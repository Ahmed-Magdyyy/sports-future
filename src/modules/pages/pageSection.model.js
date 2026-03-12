const mongoose = require("mongoose");

const pageSectionSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure a key is unique within a page
pageSectionSchema.index({ page: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("PageSection", pageSectionSchema);
