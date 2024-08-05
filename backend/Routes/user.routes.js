import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  followUnfollowUser,
  getSuggestedUsers,
  getUserProfile,
} from "../Controller/user.controller.js";
const Router = express.Router();

Router.get("/profile/:username", protectRoute, getUserProfile);
Router.get("/suggested", protectRoute, getSuggestedUsers);
Router.post("/follow/:id", protectRoute, followUnfollowUser);
// Router.post("/update", protectRoute, updateUserProfile);

export default Router;
