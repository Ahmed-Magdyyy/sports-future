const express = require("express");
const router = express.Router();
const blogController = require("./blog.controller");
const protect = require("../../middlewares/auth.middleware");
const { uploadSingleImage } = require("../../middlewares/upload.middleware");

router.get("/", blogController.getAllBlogs);
router.post(
  "/",
  protect,
  uploadSingleImage("image"),
  blogController.createBlog,
);
router.put(
  "/:id",
  protect,
  uploadSingleImage("image"),
  blogController.updateBlog,
);
router.delete("/:id", protect, blogController.deleteBlog);
router.post("/reorder", protect, blogController.updatePositions);

module.exports = router;
