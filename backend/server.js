import express from "express";
import authRoutes from "./Routes/auth.js";
import dotenv from "dotenv";
import connectMongoDb from "./DB/connectmongoose.js";
import cookieParser from "cookie-parser";
const app = express();
dotenv.config();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
  connectMongoDb();
});
