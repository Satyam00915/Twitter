import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  commentPost,
  createPost,
  deletePost,
  getAllPosts,
  getLikedPosts,
  likeUnlikePost,
} from "../Controller/post.controller.js";
const Router = express.Router();

Router.get("/all", protectRoute, getAllPosts);
Router.get("/likes/:id", protectRoute, getLikedPosts);
Router.post("/create", protectRoute, createPost);
Router.post("/like/:id", protectRoute, likeUnlikePost);
Router.post("/comment/:id", protectRoute, commentPost);
Router.delete("/:id", protectRoute, deletePost);

export default Router;
