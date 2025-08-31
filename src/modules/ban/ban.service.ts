import Ban, { IBan } from "../../Schema/Ban/ban.schema";
import User from "../../Schema/User/user.schema";
import { Types } from "mongoose";

export class BanService {
  // Ban a user
  async banUser(
    userId: string,
    bannedBy: string,
    banDays: number,
    reason?: string
  ): Promise<{ ban: IBan; user: any }> {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is already banned
    const existingBan = await Ban.findOne({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (existingBan) {
      throw new Error("User is already banned");
    }

    // Calculate ban end date
    const banEndDate = new Date();
    banEndDate.setDate(banEndDate.getDate() + banDays);

    // Create ban record
    const ban = new Ban({
      userId: new Types.ObjectId(userId),
      bannedBy: new Types.ObjectId(bannedBy),
      reason,
      banStartDate: new Date(),
      banEndDate,
      isActive: true,
    });

    await ban.save();

    // Update user status to ban
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: "ban" },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      throw new Error("Failed to update user status");
    }

    return { ban, user: updatedUser };
  }

  // Unban a user
  async unbanUser(
    userId: string,
    unbannedBy: string
  ): Promise<{ ban: IBan; user: any }> {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Find active ban
    const ban = await Ban.findOne({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!ban) {
      throw new Error("User is not banned");
    }

    // Deactivate ban
    ban.isActive = false;
    await ban.save();

    // Update user status to active
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: "active" },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      throw new Error("Failed to update user status");
    }

    return { ban, user: updatedUser };
  }

  // Check if user is banned
  async isUserBanned(
    userId: string
  ): Promise<{ isBanned: boolean; ban?: IBan }> {
    const ban = await Ban.findOne({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (!ban) {
      return { isBanned: false };
    }

    // Check if ban has expired
    if (new Date() > ban.banEndDate) {
      // Ban has expired, deactivate it and update user status
      ban.isActive = false;
      await ban.save();

      await User.findByIdAndUpdate(userId, { status: "active" });

      return { isBanned: false };
    }

    return { isBanned: true, ban };
  }

  // Get user's ban history
  async getUserBanHistory(userId: string): Promise<IBan[]> {
    return await Ban.find({
      userId: new Types.ObjectId(userId),
    })
      .populate("bannedBy", "username name")
      .sort({ createdAt: -1 });
  }

  // Get all active bans
  async getActiveBans(): Promise<IBan[]> {
    return await Ban.find({ isActive: true })
      .populate("userId", "username name email")
      .populate("bannedBy", "username name")
      .sort({ createdAt: -1 });
  }

  // Clean up expired bans (can be called by a cron job)
  async cleanupExpiredBans(): Promise<{ cleaned: number }> {
    const expiredBans = await Ban.find({
      isActive: true,
      banEndDate: { $lt: new Date() },
    });

    if (expiredBans.length === 0) {
      return { cleaned: 0 };
    }

    // Get user IDs to update
    const userIds = expiredBans.map((ban) => ban.userId);

    // Deactivate expired bans
    await Ban.updateMany(
      { _id: { $in: expiredBans.map((ban) => ban._id) } },
      { isActive: false }
    );

    // Update user statuses to active
    await User.updateMany({ _id: { $in: userIds } }, { status: "active" });

    return { cleaned: expiredBans.length };
  }



  async toggleUserBlock(
    userId: string
  ): Promise<{ user: any; action: string }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Toggle between blocked and active
    if (user.status === "blocked") {
         // Find active ban
    const ban = await Ban.findOne({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });

    if (ban) {
      ban.isActive = false;
      await ban.save();
      }

  
      user.status = "active";
      await user.save();
      return { user, action: "unblocked" };
    } else {
      user.status = "blocked";
      await user.save();
      return { user, action: "blocked" };
    }
  }

  async blockUser(userId: string): Promise<{ user: any }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.status = "blocked";
    await user.save();
    

    return { user };
  }
}
