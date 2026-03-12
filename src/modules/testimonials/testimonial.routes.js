const express = require("express");
const router = express.Router();
const {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require("./testimonial.controller");
const protect = require("../../middlewares/auth.middleware");

router.route("/").get(getTestimonials).post(protect, createTestimonial);

router
  .route("/:id")
  .put(protect, updateTestimonial)
  .delete(protect, deleteTestimonial);

module.exports = router;
