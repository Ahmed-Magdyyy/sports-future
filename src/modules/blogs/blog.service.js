const Blog = require("./blog.model");
const {
  validateImageFile,
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} = require("../../utils/imageUpload");
class BlogService {
  async getAllBlogs() {
    return await Blog.find()
      .populate("sport", "name heroTitle")
      .sort({ position: 1, createdAt: -1 });
  }

  async createBlog(data, file) {
    const blogData = { ...data };

    // Count for position
    const count = await Blog.countDocuments();
    blogData.position = count;

    if (file) {
      validateImageFile(file);
      const result = await uploadImageToCloudinary(file, {
        folder: "sportfuture/blogs",
        publicId: `blog_${Date.now()}`,
      });

      blogData.image = {
        public_id: result.public_id,
        url: result.url,
      };
    }

    const blog = new Blog(blogData);
    return await blog.save();
  }

  async updateBlog(id, data, file) {
    const blog = await Blog.findById(id);
    if (!blog) throw new Error("Blog not found");

    const updateData = { ...data };

    if (file) {
      validateImageFile(file);

      const result = await uploadImageToCloudinary(file, {
        folder: "sportfuture/blogs",
        publicId: `blog_${Date.now()}`,
      });

      if (blog.image && blog.image.public_id) {
        await deleteImageFromCloudinary(blog.image.public_id);
      }

      updateData.image = {
        public_id: result.public_id,
        url: result.url,
      };
    }

    Object.assign(blog, updateData);
    return await blog.save();
  }

  async deleteBlog(id) {
    const blog = await Blog.findById(id);
    if (!blog) throw new Error("Blog not found");

    if (blog.image && blog.image.public_id) {
      await deleteImageFromCloudinary(blog.image.public_id);
    }

    await blog.deleteOne();
    return blog;
  }

  async updatePositions(items) {
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { position: item.position } },
      },
    }));
    if (bulkOps.length > 0) {
      await Blog.bulkWrite(bulkOps);
    }
  }
}

module.exports = new BlogService();
