const { validationResult } = require("express-validator");
const Users = require("../models/UserModel");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserOTPVerification = require("../models/UserOTPVerification");
const nodemailer = require('nodemailer');
const generateOTP = require("../generateOTP/generateOTP");

async function getAllUsers(req, res) {
  try {
    let data = await Users.find();
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
      console.log(hashedPassword);

      let updatedUser = await Users.findByIdAndUpdate(
        existingUser._id,
        {
          password: hashedPassword,
        },
        { new: true }
      );
      console.log(updatedUser);

      res.status(200).json({ success: true, user: updatedUser });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// const sendOTPVerificationEmail = async (to, otp) => {
//   try {
//     const otp = `${Math.floor(1000 + Math.random() * 9000)}`
//     const mailOptions = {
//       from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>',
//       to,
//       subject: "Verify Your Email",
//       html: `<p>Your OTP code is: <b>${otp}</b></p>`
//     };

//     const hashedOTP = await bcryptjs.hash(otp,saltRounds);
//     new UserOTPVerification({
//       userId:_id,
//       otp:hashedOTP,
//     })

//     const info = await transporter.sendMail(mailOptions);

//     console.log("Message sent: %s", info.messageId);
//   } catch (error) {
//     console.error("Error sending email: ", error);
//   }

const sendOTPVerificationEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "lester.hand@ethereal.email",
      pass: "DWXRZQFDTjKwQE65bd",
    },
  });

  const mailOptions = {
    from: '"Your Site" <your_email@example.com>',
    to: email,
    subject: "Your OTP Verification Code",
    html: `<p>Your OTP is <b>${otp}</b></p>`,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  verifyToken,
  updatePassword,
  sendOTPVerificationEmail
};
