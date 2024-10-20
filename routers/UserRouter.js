const express = require("express");
const {
  registerUser,
  getAllUsers,
  loginUser,
  verifyToken,
  updatePassword,
  sendOTP,
  verifyOtp,
} = require("../controllers/UserController");
const {
  validator,
  passwordValidator,
} = require("../middlewares/validatormidlleware");
const { upload } = require("../middlewares/uploadMiddleware");

const Router = express.Router();

Router.get("/", getAllUsers);

Router.post("/register",upload.single("photo") ,validator,  registerUser);

Router.post("/login", loginUser);
Router.get("/verify", verifyToken);
Router.post("/userotp", sendOTP);
Router.post("/verifyotp", verifyOtp);

Router.post("/updatepassword", passwordValidator, updatePassword);

module.exports = Router;
