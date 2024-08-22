const express = require("express");
const {
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getSingleProduct,
} = require("../controllers/ProductController");
const checkLogin = require("../middlewares/checkLoginmiddleware");


const Router = express.Router();

Router.get("/", getAllProducts);
Router.get("/singleproduct/:id", getSingleProduct);





Router.post("/create",checkLogin, createProduct);
Router.put("/update/:id",checkLogin, updateProduct);
Router.delete("/delete/:id",checkLogin, deleteProduct);

module.exports = Router;
