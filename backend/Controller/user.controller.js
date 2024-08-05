import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

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
