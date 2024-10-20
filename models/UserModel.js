const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    
    name: {
      type: String,
      minlength: 3,
      maxlength: 22,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
    image:{
      url: {
        type: String,
        trim: true
      },
      public_id: {
        type: String,
        trim: true,
      },
    },
  }
);

const Users = mongoose.model("users", userSchema);
module.exports = Users;
