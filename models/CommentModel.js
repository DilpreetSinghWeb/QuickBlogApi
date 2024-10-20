const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  text: {
    type: String,
    required: [true, "Comment text is required"],
  },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const commentModel = mongoose.model("Comment", commentSchema);

module.exports = commentModel;
