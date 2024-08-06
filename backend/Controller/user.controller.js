import { v2 as cloudinary } from "cloudinary";

import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User Not Found" });

    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
    console.log(error);
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    if (id === user._id.toString())
      return res
        .status(400)
        .json({ message: "You cannot Follow/Unfollow Yourself" });

    const userToModify = await User.findById({ _id: id }).select("-password");
    const currentUser = await User.findById({ _id: user._id }).select(
      "-password"
    );

    const isFollowing = userToModify.followers.includes(currentUser._id);
    if (isFollowing) {
      //Unfollow the User
      await User.findByIdAndUpdate(
        { _id: userToModify._id },
        { $pull: { followers: currentUser._id } }
      );

      await User.findByIdAndUpdate(
        { _id: currentUser._id },
        { $pull: { following: userToModify._id } }
      );
      res.status(200).json({ message: "User unfollowed Successfully" });
    } else {
      //Follow the User
      await User.findByIdAndUpdate(
        { _id: userToModify._id },
        { $push: { followers: currentUser._id } }
      );

      await User.findByIdAndUpdate(
        { _id: currentUser._id },
        { $push: { following: userToModify._id } }
      );

      //Send Notification To the User
      const newNotification = await Notification.create({
        type: "follow",
        from: currentUser._id,
        to: userToModify._id,
      });
      res.status(200).json({ message: "User followed Successfully" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: `Internal Server Error. Error: ${error}` });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFollowedByMe = await User.findById({ _id: userId }).select(
      "following"
    );

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );

    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.map((user) => {
      user.password = null;
    });
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "No suggested users found" });
  }
};

export const updateUser = async (req, res) => {
  const { fullName, email, currentPassword, newPassword, username, bio, link } =
    req.body;

  let { profileImg, coverImg } = req.body;
  const userId = req.user._id;
  try {
    const user = await User.findById({ _id: userId });
    if (!user) return res.status(404).json({ message: "User Not Found" });

    if (
      (!currentPassword && newPassword) ||
      (!newPassword && currentPassword)
    ) {
      return res
        .status(400)
        .json({ error: "Please provide both current and new Password." });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    const newuser = await user.save();

    newuser.password = null;

    return res.status(200).json({ userData: newuser });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Internal error Occurred." });
  }
};
