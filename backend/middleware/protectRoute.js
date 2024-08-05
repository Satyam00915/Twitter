import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized: Token Invalid" });
    }

    const user = await User.findById({ _id: decoded.userId }).select(
      "-password"
    );

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware");
    res.status(500).json({ error: "Internal Server error" });
  }
};
