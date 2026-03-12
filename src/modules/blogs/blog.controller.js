const blogService = require("./blog.service");

class BlogController {
  async getAllBlogs(req, res) {
    try {
      const blogs = await blogService.getAllBlogs();
      res.json(blogs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createBlog(req, res) {
    try {
      if (!req.body.sport) {
        delete req.body.sport; // If empty string, remove it to avoid ObjectId casting error
      }
      const blog = await blogService.createBlog(req.body, req.file);
      res.status(201).json(blog);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateBlog(req, res) {
    try {
      if (req.body.sport === "") {
        req.body.sport = null;
      }
      const blog = await blogService.updateBlog(req.params.id, req.body, req.file);
      res.json(blog);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteBlog(req, res) {
    try {
      await blogService.deleteBlog(req.params.id);
      res.json({ message: "Blog removed" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updatePositions(req, res) {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: "Items must be an array" });
      }
      await blogService.updatePositions(items);
      res.json({ message: "Positions updated successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new BlogController();
