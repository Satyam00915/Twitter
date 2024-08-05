import jwt from "jsonwebtoken";
export const generateTokenandSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    maxAge: 1 * 24 * 60 * 60 * 1000, //ms
    httpOnly: true, // prevent XSS attacks
    samesite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });
};
