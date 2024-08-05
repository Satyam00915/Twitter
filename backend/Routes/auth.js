import express from "express";
import { getMe, login, logOut, signup } from "../Controller/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const Router = express.Router();

Router.get("/me", protectRoute, getMe);

Router.post("/signup", signup);

Router.post("/login", login);

Router.post("/logout", logOut);

export default Router;
