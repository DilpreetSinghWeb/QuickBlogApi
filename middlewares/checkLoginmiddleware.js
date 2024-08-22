const jwt = require("jsonwebtoken");
const Users = require("../models/UserModel");

async function checkLogin(req, res, next) {
  try {
    let header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ success: false, message: "No header provided" });
    }

    let token = header.split(" ")[1];
    if (!token) {
        res.status(401).json({ success: false, message: "No token provided" });
    }

    let { userId } = jwt.verify(token, "thisismysecretkey"); 
    let user = await Users.findById(userId);
    if (!user) {
        return res.status(403).json({ success: false, message: "You are not allowed to access this" });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = checkLogin;
