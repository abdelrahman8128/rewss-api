import { ISeller } from "./../../Schema/User/seller.schema";
import User, { IUser } from "../../Schema/User/user.schema";
import Ad from "../../Schema/Ad/ad.schema";
import { Types } from "mongoose";
import Seller from "../../Schema/User/seller.schema";
import { S3Service } from "../../service/s3.service";
import AdImageSchema from "Schema/AdImage/Ad.image.schema";
import asyncHandler from "express-async-handler";
import sharp from "sharp";
import { CreateSellerPhysicalAddressDto } from "./DTO/seller-physical-address.dto";

export class UserService {
  // Get user data
  async getUserData(
    userId: string,
    includePassword: boolean = false
  ): Promise<IUser | ISeller> {
    const selectFields = includePassword ? "password" : "";
    const user = (await User.findById(userId).select(selectFields)) as
      | IUser
      | ISeller;

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "seller") {
      return user as ISeller;
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

  async updateUser(
    userId: string,
    payload: any,
    files: Express.Multer.File[]
  ): Promise<any> {
    if (payload.email) {
      payload.isEmailVerified = false;
    }
    if (payload.phoneNumber) {
      payload.isPhoneVerified = false;
    }

    let user = await User.findByIdAndUpdate(userId, payload, {
      new: true,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Collect all storePhotos files
    const storePhotosFiles: Express.Multer.File[] = [];

    for (const f of files) {
      if (f.fieldname === "avatar") {
        await this.changeAvatar(userId, f);
      }
      if (user.role === "seller") {
        if (f.fieldname === "logo") {
          await this.changeLogo(userId, f);
        }
        if (f.fieldname === "storePhoto") {
          storePhotosFiles.push(f);
        }
      }
    }

    // Process all storePhotos files together
    if (storePhotosFiles.length > 0) {
      await this.changeStorePhotos(
        userId,
        storePhotosFiles,
        payload.storePhoto
      );
    }

    // var updatedUser;
    // if (user.role === "seller") {
    //   updatedUser = await Seller.findByIdAndUpdate(userId, payload, {
    //     new: true,
    //   });
    // } else {
    //   updatedUser = await User.findByIdAndUpdate(userId, payload, {
    //     new: true,
    //   });
    // }

    const updatedUser = await User.findById(userId);
    return updatedUser;
  }

  private async changeAvatar(
    userId: string,
    avatar: any
  ): Promise<IUser | ISeller> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const s3Service = new S3Service();
      if (user.avatar?.imageId) {
        await s3Service.delete(user.avatar.imageId);
      }

      // Compress image quality
      const compressedBuffer = await sharp(avatar.buffer)
        .resize(300, 300, {
          fit: "cover",
          position: "center",
        })
        .jpeg({
          quality: 70,
          progressive: true,
        })
        .toBuffer();

      const newImage = await s3Service.upload({
        Bucket: process.env.S3_BUCKET,
        Key: `users/avatar/${userId}-${Date.now()}.jpg`,
        Body: compressedBuffer,
        ContentType: "image/jpeg",
        ACL: "public-read",
      });

      user.avatar = {
        imageId: newImage.key,
        imageUrl: newImage.url,
      };
      await user.save();

      return user;
    } catch (error) {
      throw error;
    }
  }

  private async changeLogo(userId: string, logo: any): Promise<ISeller> {
    try {
      const seller = await Seller.findById(userId);
      if (!seller) {
        throw new Error("Seller not found");
      }

      const s3Service = new S3Service();
      if (seller.logo?.imageId) {
        await s3Service.delete(seller.logo.imageId);
      }

      const compressedBuffer = await sharp(logo.buffer)
        .resize(300, 300, {
          fit: "cover",
          position: "center",
        })
        .jpeg({
          quality: 70,
          progressive: true,
        })
        .toBuffer();

      const newImage = await s3Service.upload({
        Bucket: process.env.S3_BUCKET,
        Key: `users/logo/${userId}-${Date.now()}.jpg`,
        Body: compressedBuffer,
        ContentType: "image/jpeg",
        ACL: "public-read",
      });

      seller.logo = {
        imageId: newImage.key,
        imageUrl: newImage.url,
      };
      await seller.save();

      return seller;
    } catch (error) {
      throw error;
    }
  }

  private async changeStorePhotos(
    userId: string,
    storePhotos: Express.Multer.File[],
    existingPhotoKeys?: string[]
  ): Promise<ISeller> {
    try {
      const seller = await Seller.findById(userId);
      if (!seller) {
        throw new Error("Seller not found");
      }

      console.log("existingPhotoKeys", existingPhotoKeys);

      const s3Service = new S3Service();

      // Keep existing photos that are specified in the request
      const photosToKeep = [];
      const photosToDelete = [];

      if (seller.storePhotos && seller.storePhotos.length > 0) {
        for (const photo of seller.storePhotos) {
          if (photo._id) {
            // If existingPhotoKeys is provided and this photo's _id is in the list, keep it
            if (
              existingPhotoKeys &&
              existingPhotoKeys.includes(photo._id.toString())
            ) {
              photosToKeep.push(photo);
            } else {
              // Otherwise, mark it for deletion
              photosToDelete.push(photo);
            }
          }
        }
      }

      // Delete photos that are not in the keep list
      for (const photo of photosToDelete) {
        if (photo.imageId) {
          await s3Service.delete(photo.imageId);
        }
      }

      // Process new store photos
      const newProcessedPhotos = [];
      for (const photo of storePhotos) {
        const compressedBuffer = await sharp(photo.buffer)
          .jpeg({
            quality: 70,
            progressive: true,
          })
          .toBuffer();

        const newImage = await s3Service.upload({
          Bucket: process.env.S3_BUCKET,
          Key: `users/sellers/${
            seller.username
          }/storePhotos/${userId}-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 11)}.jpg`,
          Body: compressedBuffer,
          ContentType: "image/jpeg",
          ACL: "public-read",
        });

        newProcessedPhotos.push({
          _id: new Types.ObjectId(),
          imageId: newImage.key,
          imageUrl: newImage.url,
        });
      }

      // Combine kept photos with new photos
      seller.storePhotos = [...photosToKeep, ...newProcessedPhotos];
      await seller.save();

      return seller;
    } catch (error) {
      throw error;
    }
  }

  // Set seller physical address
  async setSellerPhysicalAddress(
    sellerId: string,
    addressData: CreateSellerPhysicalAddressDto
  ): Promise<ISeller> {
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      throw new Error("Seller not found");
    }

    if (seller.role !== "seller") {
      throw new Error("User is not a seller");
    }

    seller.physicalAddress = addressData;
    await seller.save();

    return seller;
  }
}
