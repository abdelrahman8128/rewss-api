import User, { IUser } from "../../Schema/User/user.schema";
import Ad from "../../Schema/Ad/ad.schema";
import { Types } from "mongoose";

export class UserService {
  // Get user data
  async getUserData(userId: string): Promise<IUser> {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  // Toggle favorites (add if not present, remove if present)
  async toggleFavorites(
    userId: string,
    adId: string
  ): Promise<{ user: IUser; message: string; action: string }> {
    // Check if ad exists
    const ad = await Ad.findById(adId);
    if (!ad) {
      throw new Error("Ad not found");
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const adObjectId = new Types.ObjectId(String(adId));
    const isInFavorites = user.favorites.includes(adObjectId);

    let updatedUser: IUser;
    let message: string;
    let action: string;

    if (isInFavorites) {
      // Remove from favorites
      updatedUser = (await User.findByIdAndUpdate(
        userId,
        { $pull: { favorites: adId } },
        { new: true }
      ).select("-password")) as IUser;

      message = "Ad removed from favorites successfully";
      action = "removed";
    } else {
      // Add to favorites
      updatedUser = (await User.findByIdAndUpdate(
        userId,
        { $push: { favorites: adId } },
        { new: true }
      ).select("-password")) as IUser;

      message = "Ad added to favorites successfully";
      action = "added";
    }

    if (!updatedUser) {
      throw new Error("Failed to update user favorites");
    }

    return { user: updatedUser, message, action };
  }

  // List favorites with pagination similar to ads listing (exclude album)
  async listFavorites(
    userId: string,
    query: any
  ): Promise<{
    items: any[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const user = await User.findById(userId).select("favorites");

    if (!user) {
      throw new Error("User not found");
    }

    const pageNumber = Math.max(1, Number(query?.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query?.limit) || 20));
    const skip = (pageNumber - 1) * pageSize;

    const filter: any = { _id: { $in: user.favorites } };

    const [items, total] = await Promise.all([
      Ad.find(filter)
        .select("-album -models._id")
        .populate([
          { path: "thumbnail", select: "imageUrl" },
          {
            path: "models.model",
            select: "-_id -createdAt -updatedAt -__v",
            populate: { path: "brand", select: "name logo -_id" },
          },

          { path: "category" },
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Ad.countDocuments(filter),
    ]);

    return {
      items,
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  // Remove from favorites (bonus method)
  async removeFromFavorites(userId: string, adId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if ad is in favorites
    if (!user.favorites.includes(new Types.ObjectId(String(adId)))) {
      throw new Error("Ad not in favorites");
    }

    // Remove ad from favorites
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: adId } },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      throw new Error("Failed to update user favorites");
    }

    return updatedUser;
  }

  // Search users with filters (admin only)
  async searchUsers(query: {
    search?: string;
    status?: string;
    role?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    users: IUser[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    const pageNumber = Math.max(1, Number(query?.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query?.limit) || 20));
    const skip = (pageNumber - 1) * pageSize;

    // Build search filter
    const filter: any = {};

    // Text search across phone, email, and username
    if (query.search) {
      const searchRegex = new RegExp(query.search, "i");
      filter.$or = [
        { phoneNumber: searchRegex },
        { email: searchRegex },
        { username: searchRegex },
      ];
    }

    // Status filter
    if (query.status) {
      filter.status = query.status;
    }

    // Role filter
    if (query.role) {
      filter.role = query.role;
    }

    // Execute search with pagination
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      User.countDocuments(filter),
    ]);

    return {
      users,
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }
}
