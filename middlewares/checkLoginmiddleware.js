const jwt = require("jsonwebtoken");
const Users = require("../models/UserModel");

async function checkLogin(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ success: false, message: "No header provided" });
    }

    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const { userId } = jwt.verify(token, "thisismysecretkey"); 
    const user = await Users.findById(userId);
     // Exclude password

    if (!user) {
      return res.status(403).json({ success: false, message: "You are not allowed to access this" });
    }
    
    req.user = user; 
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = checkLogin;
