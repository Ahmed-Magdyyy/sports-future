const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Testimonial text is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

module.exports = Testimonial;
