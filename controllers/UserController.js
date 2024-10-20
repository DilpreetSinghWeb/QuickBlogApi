const { validationResult } = require("express-validator");
const Users = require("../models/UserModel");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cloudinary = require("../utils/cloudinary");
const generateOTP = require("../generateOTP/generateOTP");

const otpStore = {};

async function getAllUsers(req, res) {
  try {
    let data = await Users.find();//fetch all users form db
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function verifyToken(req, res, next) {
  try {
    let header = req.headers.authorization;
    if (!header) {
      return res
        .status(401)
        .json({ success: false, message: "No header provided" });
    }

    let token = header.split(" ")[1];
    if (!token) {
      res.status(401).json({ success: false, message: "No token provided" });
    }

    let { userId } = jwt.verify(token, "thisismysecretkey");
    let user = await Users.findById(userId);
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function registerUser(req, res) {
  try {
    let result = validationResult(req);
    let errors = result.errors;
    if (errors.length != 0) {
      let err = errors.map((er) => er.msg);
      return res.status(400).json({ success: false, message: err[0] });
    }
    const {name,email,password} = req.body;
    const file = req.file;
    const photoUpload = await cloudinary.uploader.upload(req.file.path, {
      folder: "BlogWebsite/users",
    });
    
    let data = req.body;
    let existingUser = await Users.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "You are already registered, please login",
      });
    }

    let hashPassword = bcryptjs.hashSync(data.password, 10);

    let user = await Users.create({ ...data, password: hashPassword });
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function loginUser(req, res) {
  try {
    let data = req.body;
    let existingUser = await Users.findOne({ email: data.email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "No user found, please register first",
      });
    }
    let result = bcryptjs.compareSync(data.password, existingUser.password);
    if (!result) {
      return res
        .status(400)
        .json({ success: false, message: "Wrong password" });
    }

    let token = jwt.sign({ userId: existingUser._id }, "thisismysecretkey");

    res.status(200).json({ success: true, user: existingUser, token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async function updatePassword(req, res) {
  try {
    let result = validationResult(req);
    let errors = result.errors;
    if (errors.length != 0) {
      let err = errors.map((er) => er.msg);
      return res.status(400).json({ success: false, message: err[0] });
    }
    let { email, password, confirmPassword } = req.body;
    let existingUser = await Users.findOne({ email: email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "No user found, please register first",
      });
    }

    if (password === confirmPassword) {
      const hashedPassword = await bcryptjs.hash(password, 10);

      let updatedUser = await Users.findByIdAndUpdate(
        existingUser._id,
        {
          password: hashedPassword,
        },
        { new: true }
      );

      res.status(200).json({ success: true, user: updatedUser });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

const sendOTP = async (req, res) => {
  let result = validationResult(req);
  let errors = result.errors;
  if (errors.length != 0) {
    let err = errors.map((er) => er.msg);
    return res.status(400).json({ success: false, message: err[0] });
  }

  const email = req.body.email;
  const otp = generateOTP();
  const expirationTime = Date.now() + 5 * 60 * 1000;
  const expirationTimeFormatted = new Date(expirationTime).toLocaleTimeString();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"Your Site" <your_email@example.com>',
    to: email,
    subject: "Your OTP Verification Code",
    html: `
     <p>Your OTP code is <b>${otp}</b>.</p>
      <p>This OTP will expire in 5 minutes, at <b>${expirationTimeFormatted}</b>.</p>
      <p>If you did not request this OTP, please ignore this email.</p>
      `,
  };
  try {
    let info = await transporter.sendMail(mailOptions);

    otpStore[email] = {
      otp: otp,
      expiresAt: expirationTime,
    };

    res.status(200).json({ success: true, user: info });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: " OTP is required.",
      });
    }

    const storedOTPData = otpStore[email];
    if (!storedOTPData) {
      return res.status(404).json({
        success: false,
        message: "OTP request not found. Please request a new OTP.",
      });
    }
    const currentTime = Date.now();
    if (currentTime > storedOTPData.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({
        success: false,
        message: "Your OTP has expired.",
      });
    }
    if (otp !== storedOTPData.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    delete otpStore[email];

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
};

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  verifyToken,
  updatePassword,
  sendOTP,
  verifyOtp,
};
