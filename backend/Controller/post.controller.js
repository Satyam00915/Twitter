import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to fetch posts" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User Not Found" });
    if (!text && !img) {
      return res.status(400).json({ error: "Post Must have text or image" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(500).json(newPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ message: "Post Not Found" });
    }

    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      await Post.findByIdAndUpdate(postId, {
        $pull: { likes: userId },
      });

      await User.findByIdAndUpdate(userId, {
        $pull: { likedPost: postId },
      });

      return res.status(200).json({ message: "Post Unliked Successfully" });
    } else {
      await Post.findByIdAndUpdate(postId, {
        $push: { likes: userId },
      });

      await User.findByIdAndUpdate(userId, {
        $push: { likedPost: postId },
      });

      await Notification.create({
        from: userId,
        to: post.user,
        type: "like",
      });

      res.status(200).json({ message: "You have liked the Post" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id.toString();

    if (!text) {
      return res.status(400).json({ error: "Comment must have text" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(400).json({ message: "No such Post exists" });
    }

    const commentedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { comments: { text, user: userId } },
      },
      { new: true }
    );

    res.status(200).json(commentedPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(400).json({ error: "Post Not Found!" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You are not Authorized to delete the Post" });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User Not Found!" });
    }

    const likedPosts = await Post.find({
      _id: { $in: user.likedPost },
    })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};
