const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      required: true,
    },
    author: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      url: {
        type: String,
        trim: true,
        required: true,
      },
      public_id: {
        type: String,
        trim: true,
      },
      originalFilename: {
        type: String,
        trim: true,
      },
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
