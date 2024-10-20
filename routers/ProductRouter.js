const express = require("express");
const {
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getSingleProduct,
} = require("../controllers/ProductController");
const { productAddComment, updateReviewLikes, getAllComments } = require("../controllers/CommentController");
const checkLogin = require("../middlewares/checkLoginmiddleware");
const { upload } = require("../middlewares/uploadMiddleware");

const Router = express.Router();

Router.get("/", getAllProducts);
Router.get("/singleproduct/:id", getSingleProduct);

// product routes
Router.post("/create", checkLogin, upload.single("image"), createProduct);
Router.put("/update/:id", checkLogin, upload.single("image"), updateProduct);
Router.delete("/delete/:id", checkLogin, deleteProduct);

// Review routes
Router.get("/comments",getAllComments);
Router.post("/:id/add-comment", checkLogin,productAddComment);
// Router.put("/comments/:id/likes",checkLogin,updateReviewLikes);







module.exports = Router;
