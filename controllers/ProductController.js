const Products = require("../models/ProductModel");
const Users = require("../models/UserModel");
const jwt = require("jsonwebtoken");

async function getSingleProduct(req, res) {
  try {
    let {id} = req.params;
    let singleProduct = await Products.findById(id);
    if (!singleProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product: singleProduct });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getAllProducts(req, res) {
  try {
    let data = await Products.find();
    res.status(200).json({ success: true, products: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function createProduct(req, res) {
  try {
    const { title, author, category, imageUrl, description } = req.body;

    const existingProduct = await Products.findOne({
      title,
      author,
      category,
      imageUrl,
      description,
    });
    if (existingProduct) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Product with this title, category, imageUrl and description already exists",
        });
    }

    let data = req.body;
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
    let productData = await Products.findByIdAndUpdate(id, data, { new: true });
    if (!productData) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product: productData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function deleteProduct(req, res) {
  try {
    let id = req.params.id;
    let product = await Products.findByIdAndDelete(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
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
  getSingleProduct,
};
