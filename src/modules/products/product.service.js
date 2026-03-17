const Product = require("./product.model");
const { ApiError } = require("../../utils/ApiError");
const {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} = require("../../utils/imageUpload");

class ProductService {
  async getProducts() {
    return await Product.find().sort({ createdAt: -1 }).lean();
  }

  async getProductById(id) {
    const product = await Product.findById(id).lean();
    if (!product) {
      throw new ApiError(`No product found for this id: ${id}`, 404);
    }
    return product;
  }

  async createProduct(payload, file) {
    let imageObj;

    if (!file) {
      throw new ApiError("Product image is required", 400);
    }

    const result = await uploadImageToCloudinary(file, {
      folder: "sportfuture/products",
      publicId: `product_${Date.now()}`,
    });

    imageObj = {
      url: result.url,
      public_id: result.public_id,
    };

    try {
      const product = await Product.create({
        ...payload,
        image: imageObj,
      });
      return product.toObject();
    } catch (err) {
      if (imageObj?.public_id) {
        await deleteImageFromCloudinary(imageObj.public_id);
      }
      throw err;
    }
  }

  async updateProduct(id, payload, file) {
    const product = await Product.findById(id);
    if (!product) {
      throw new ApiError(`No product found for this id: ${id}`, 404);
    }

    const { name, price } = payload;
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;

    let newImageObj;
    let oldPublicId;

    if (file) {
      oldPublicId = product.image?.public_id;
      const result = await uploadImageToCloudinary(file, {
        folder: "sportfuture/products",
        publicId: `product_${Date.now()}`,
      });
      newImageObj = {
        url: result.url,
        public_id: result.public_id,
      };
      product.image = newImageObj;
    }

    try {
      const updated = await product.save();

      if (oldPublicId && file) {
        await deleteImageFromCloudinary(oldPublicId);
      }

      return updated.toObject();
    } catch (err) {
      if (newImageObj?.public_id) {
        await deleteImageFromCloudinary(newImageObj.public_id);
      }
      throw err;
    }
  }

  async deleteProduct(id) {
    const product = await Product.findById(id);
    if (!product) {
      throw new ApiError(`No product found for this id: ${id}`, 404);
    }

    if (product.image?.public_id) {
      await deleteImageFromCloudinary(product.image.public_id);
    }

    await product.deleteOne();
    return true;
  }
}

module.exports = new ProductService();
