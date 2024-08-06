import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  commentPost,
  createPost,
  deletePost,
  likeUnlikePost,
} from "../Controller/post.controller.js";
const Router = express.Router();

Router.post("/create", protectRoute, createPost);
Router.post("/like/:id", protectRoute, likeUnlikePost);
Router.post("/comment/:id", protectRoute, commentPost);
Router.delete("/", protectRoute, deletePost);

export default Router;
