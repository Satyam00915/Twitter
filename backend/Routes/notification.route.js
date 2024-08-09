import express from "express";
const Router = express.Router();

Router.get("/", (req, res) => {
  res.json({ message: "Its working" });
});

export default Router;
