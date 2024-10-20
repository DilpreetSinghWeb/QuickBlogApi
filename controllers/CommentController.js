const Products = require("../models/ProductModel");
const Comment = require("../models/CommentModel");
const Users = require("../models/UserModel");

async function getAllComments(req, res) {
  try {
    const comments = await Comment.find({});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
}

async function productAddComment(req, res) {
  const productId = req.params.id;
  const { text } = req.body;
  

  if (!text) {
    return res.status(400).json({ message: "Comment text is required." });
  }

  try {
    const product = await Products.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    const userId = req.user;

    
    
    if (product.createdBy.toString() === userId._id.toString()) {
      return res.status(403).json({ message: "You cannot comment on your own post." });
    }

    const userCommentsCount = await Comment.countDocuments({
      product: productId,
      user: userId,
    });

    if (userCommentsCount >= 2) {
      return res.status(403).json({ message: "You can only add up to 2 comments on every post" });
    }


    const newComment = await Comment.create({
      product: productId,
      user: userId,
      text,
    });

    const populatedComment = await newComment.populate("user");

    product.comments.push(newComment._id);
    await product.save();

    return res.status(201).json({
      message: "Comment added successfully.",
      comment: populatedComment,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// async function updateReviewLikes(req, res) {
//   try {
//     const productId = req.params.id;
//     const commentId = req.body.commentId;
//     const { action } = req.body;

//     const product = await Products.findById(productId).populate("comments");

//     const comment = product.comments.find(
//       (c) => c._id.toString() === commentId
//     );
    

//     if (!comment) {
//       return res.status(404).json({ message: "Comment not found" });
//     }

//     if (action === "like") {
//       comment.likes += 1;
//       if (comment.likes > 0) {
//         comment.likes += 1;
//       }
//     } else if (action === "dislike") {
//       if (comment.likes > 0) {
//         comment.likes -= 1;
//       }
//     }

//     await Comment.findByIdAndUpdate(commentId, {
//       likes: comment.likes,
//       dislikes: comment.dislikes,
//     });

//     await product.save();
//     return res.status(200).json({ message: "Likes updated successfully!", comment });
//   } catch (error) {
//     return res.status(500).json({ message: "An error occurred while updating likes/dislikes." });
//   }
// }

module.exports = {
  getAllComments,
  productAddComment,
  // updateReviewLikes,
};
