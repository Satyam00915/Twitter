import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  deleteNotification,
  deleteOneNotification,
  getNotification,
} from "../Controller/notification.controller.js";
const Router = express.Router();

Router.get("/", protectRoute, getNotification);

Router.delete("/", protectRoute, deleteNotification);

Router.delete("/:id", protectRoute, deleteOneNotification);

export default Router;
