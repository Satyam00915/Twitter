import Notification from "../models/notification.model.js";

export const getNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ to: userId })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "from",
        select: "username profileImg",
      });

    await Notification.updateMany({ to: userId }, { read: true });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notifications Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteOneNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const notification = await Notification.findById(id);
    if (!notification) {
      res.status(200).json({ message: "Notification not found" });
    }

    if (notification.to.toString() !== user._id.toString()) {
      res.status(403).json({
        message: "You are not authorized to delete this notification",
      });
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({ message: "Notification Deleted" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error!" });
  }
};
