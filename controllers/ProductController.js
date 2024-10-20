const Products = require("../models/ProductModel");
const Comment = require("../models/CommentModel");
const jwt = require("jsonwebtoken");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const path = require("path");


async function getSingleProduct(req, res) {
  try {
    let { id } = req.params;//extract product id from req.param
    let singleProduct = await Products.findById(id).populate("comments").populate("createdBy");//wait keywords for pause the exectuion until req.params finished
    if (!singleProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product: singleProduct });
  } catch (error) {//standard http status code that indicats successful
    res.status(500).json({ success: false, error: error.message });
  }//500 is internal server error
}

async function getAllProducts(req, res) {
  try {
    let data = await Products.find().populate("comments").populate("createdBy");
    res.status(200).json({ success: true, products: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function createProduct(req, res) {
  try {
    let imageUrl = null;
    let originalFilename = null;
    let result = await cloudinary.uploader.upload(req.file.path,{
      folder:"BlogWebsite/products",
    });

    let normalizedPath = req.file.path.split("\\").join("/");

    fs.unlinkSync(normalizedPath);

    imageUrl = result.url;
    public_id = result.public_id;
    originalFilename = result.original_filename;

    const { title, author, category, description } = req.body;
    const userId = req.user;

    const existingProduct = await Products.findOne({
      title,
      author,
      category,
      imageUrl,
      description
    });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message:
          "Product with this title, category, imageUrl and description already exists",
      });
    }

    let data = {
      title: title,
      author: author,
      category: category,
      image: { url: imageUrl, public_id: public_id },
      description: description,
      createdBy:userId
    };

    let product = await Products.create(data);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function updateProduct(req, res) {
  try {
    let id = req.params.id;
    let data = req.body;

    let result = null;

    if (req.file) {
      // Upload the new image to Cloudinary
      result = await cloudinary.uploader.upload(req.file.path,{
        folder:'BlogWebsite/products'
      });
      let normalizedPath = req.file.path.split("\\").join("/");
      fs.unlinkSync(normalizedPath);
    }

    let product = await Products.findById(id);

    if (product.image.public_id) {
      await cloudinary.uploader.destroy(product.image.public_id);
    }

    let updateData = {
      title: data.title,
      author: data.author,
      category: data.category,
      description: data.description,
    };
    if (result) {
      updateData.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    let updatedData = await Products.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedData) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product: updateData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function deleteProduct(req, res) {
  try {
    let id = req.params.id;
    
    let product = await Products.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.image.public_id) {
      await cloudinary.uploader.destroy(product.image.public_id);
    }

    await Products.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}


module.exports = {
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getSingleProduct
};
