import express from "express";
import mongoose from "mongoose";
import Mail from "../models/Mail.js";
import User from "../models/User.js";

const router = express.Router();

// Send mail to a specific user or all users (SiteMaster only)
router.post("/send-system-mail", async (req, res) => {
  try {
    const { 
      sender = "Starlit Journals Team",
      title, 
      content, 
      recipientType, // 'all' or 'specific'
      recipientId,   // userId if recipientType is 'specific'
      mailType = "other", 
      expiryDate 
    } = req.body;

    // Validate required fields
    if (!title || !content || !recipientType) {
      return res.status(400).json({ message: "Title, content, and recipient type are required." });
    }

    let newMail;

    if (recipientType === 'all') {
      newMail = new Mail({
        sender,
        title,
        content,
        mailType,
        isSystemMail: true,
        sendToAllUsers: true,
        date: new Date(),
        expiryDate: expiryDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days default
      });
      await newMail.save();
    } else if (recipientType === 'specific') {
      if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
        return res.status(400).json({ message: "A valid recipient user ID is required." });
      }

      const user = await User.findById(recipientId);
      if (!user) {
        return res.status(404).json({ message: "Recipient user not found." });
      }

      newMail = new Mail({
        sender,
        title,
        content,
        mailType,
        isSystemMail: true,
        sendToAllUsers: false,
        recipients: [{ userId: recipientId, read: false, rewardClaimed: false, receivedAt: new Date() }],
        date: new Date(),
        expiryDate: expiryDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      });
      await newMail.save();
    } else {
      return res.status(400).json({ message: "Invalid recipient type." });
    }

    res.status(201).json({
      message: "System mail sent successfully!",
      mail: newMail,
    });
  } catch (error) {
    console.error("Error creating system mail:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Send mail to all users (SiteMaster only)
router.post("/sendMail", async (req, res) => {
  try {
    const { title, content, sender = "Starlit Journals Team", mailType = "other", expiryDate } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    // Create new system mail
    const newMail = new Mail({
      sender,
      title,
      content,
      mailType,
      isSystemMail: true,
      sendToAllUsers: true,
      date: new Date(),
      expiryDate: expiryDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days default
    });

    await newMail.save();

    res.status(201).json({
      message: "System mail created successfully!",
      mail: newMail,
    });
  } catch (error) {
    console.error("Error creating system mail:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get all mails for a specific user
router.get("/mails/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find all mails for this user:
    // 1. Personal mails where user is a recipient
    // 2. System mails that haven't expired
    const mails = await Mail.find({
      $or: [
        { "recipients.userId": userId },
        {
          isSystemMail: true,
          sendToAllUsers: true,
          expiryDate: { $gt: new Date() }
        }
      ]
    }).sort({ date: -1 });

    // Transform mails to match the frontend format
    const formattedMails = mails.map((mail) => {
      const recipient = mail.recipients.find(
        (r) => r.userId.toString() === userId
      );
      return {
        id: mail._id,
        sender: mail.sender,
        title: mail.title,
        content: mail.content,
        date: mail.date.toISOString(),
        expiryDate: mail.expiryDate?.toISOString(),
        read: recipient?.read || false,
        mailType: mail.mailType,
        rewardAmount: mail.rewardAmount || 0,
        rewardClaimed: recipient?.rewardClaimed || false,
      };
    });

    res.status(200).json({ mails: formattedMails });
  } catch (error) {
    console.error("Error fetching mails:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Mark a mail as read
router.put("/mail/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    // Find the mail
    const mail = await Mail.findById(id);
    if (!mail) {
      return res.status(404).json({ message: "Mail not found." });
    }

    // For system mails, add user to recipients if not already there
    if (mail.isSystemMail && mail.sendToAllUsers) {
      const existingRecipient = mail.recipients.find(
        (r) => r.userId.toString() === userId
      );

      if (!existingRecipient) {
        mail.recipients.push({
          userId,
          read: true,
          receivedAt: new Date()
        });
      } else {
        existingRecipient.read = true;
      }
    } else {
      // For personal mails, update existing recipient
      const recipient = mail.recipients.find(
        (r) => r.userId.toString() === userId
      );
      if (!recipient) {
        return res.status(403).json({ message: "User is not a recipient of this mail." });
      }
      recipient.read = true;
    }

    await mail.save();
    res.status(200).json({ message: "Mail marked as read." });
  } catch (error) {
    console.error("Error marking mail as read:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Remove all routes and logic related to rewards, milestones, summaries, prompts, moods, seasonals, and feedback mails.
// Only keep logic for sending and retrieving notification mails like 'liked your journal', 'commented on your journal', etc.
// Remove any reward-claiming endpoints and related logic.

// Cleanup function to delete expired mails
const cleanupExpiredMails = async () => {
  try {
    const currentDate = new Date();
    const result = await Mail.deleteMany({
      expiryDate: { $lt: currentDate },
    });

    console.log(`Cleaned up ${result.deletedCount} expired mails`);
  } catch (error) {
    console.error("Error during mail cleanup:", error);
  }
};

// Delete mail
router.delete("/mail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Mail.findByIdAndDelete(id);
    res.status(200).json({ message: "Mail deleted successfully." });
  } catch (error) {
    console.error("Error deleting mail:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
