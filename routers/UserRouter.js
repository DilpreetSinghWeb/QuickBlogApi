const express = require("express");
const { registerUser, getAllUsers, loginUser, verifyToken, updatePassword, sendOTPVerificationEmail } = require("../controllers/UserController");
const { validator, passwordValidator } = require("../middlewares/validatormidlleware");

const Router = express.Router();


Router.get("/",getAllUsers);


Router.post("/register",validator,registerUser);

Router.post("/login",loginUser);
Router.get("/verify",verifyToken);
Router.get("/userotp",sendOTPVerificationEmail);


Router.post("/updatepassword",passwordValidator,updatePassword);

module.exports = Router;