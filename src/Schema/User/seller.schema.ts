// models/Seller.ts
import { Schema } from "mongoose";
import User, { IUser } from "./user.schema";

export interface ISeller extends IUser {
  physicalAddress?: {
    country?: string;
    gov?: string;
    city?: string;
    region?: string;
    street?: string;
    building?: string;
    apartment?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
    moreInfo?: string;
  };
  logo?: {
    imageId: string;
    imageUrl: string;
  };
  storePhotos?: {
    _id?: any;
    imageId: string;
    imageUrl: string;
  }[]; // array of photo URLs
  requiredDataStatus: "uncompleted" | "pending" | "approved" | "rejected";
}

const SellerSchema = new Schema<ISeller>({
  physicalAddress: {
    type: {
      country: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      gov: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      region: {
        type: String,
        required: true,
        trim: true,
      },
      street: {
        type: String,
        required: true,
        trim: true,
      },
      building: {
        type: String,
        required: true,
        trim: true,
      },
      apartment: {
        type: String,
        required: true,
        trim: true,
      },
      coordinates: {
        latitude: {
          type: Number,
          required: false,
          min: -90,
          max: 90,
        },
        longitude: {
          type: Number,
          required: false,
          min: -180,
          max: 180,
        },
      },
      moreInfo: {
        type: String,
        required: false,
        trim: true,
        maxlength: 500,
      },
    },
    required: false,
  },

  logo: {
    type: {
      imageId: {
        type: String,
        required: false,
        trim: true,
      },
      imageUrl: {
        type: String,
        required: false,
        trim: true,
      },
    },
    required: false,
  },
  storePhotos: {
    type: [
      {
        imageId: {
          type: String,
          required: false,
          trim: true,
        },
        imageUrl: {
          type: String,
          required: false,
          trim: true,
        },
      },
    ],
    required: false,
  },
  requiredDataStatus: {
    type: String,
    enum: ["uncompleted", "pending", "approved", "rejected"],
    default: "uncompleted",
  },
});

// Pre-save hook to automatically update requiredDataStatus
SellerSchema.pre("save", function (next) {
  // Only apply to sellers
  if (this.role !== "seller") {
    return next();
  }

  // Only run if logo, storePhotos, or physicalAddress are being modified
  if (
    !this.isModified("logo") &&
    !this.isModified("storePhotos") &&
    !this.isModified("physicalAddress")
  ) {
    return next();
  }

  // Check if seller has required data
  const hasLogo = this.logo && this.logo.imageId;
  const hasEnoughStorePhotos = this.storePhotos && this.storePhotos.length >= 2;
  const hasCompleteAddress =
    this.physicalAddress &&
    this.physicalAddress.country &&
    this.physicalAddress.gov &&
    this.physicalAddress.city &&
    this.physicalAddress.region &&
    this.physicalAddress.street &&
    this.physicalAddress.building &&
    this.physicalAddress.apartment;

  // Determine the new status
  let newStatus: "uncompleted" | "pending" | "approved" | "rejected";

  if (!hasLogo || !hasEnoughStorePhotos || !hasCompleteAddress) {
    newStatus = "uncompleted";
  } else {
    // Only set to pending if current status is not already approved/rejected
    if (
      this.requiredDataStatus === "approved" ||
      this.requiredDataStatus === "rejected"
    ) {
      newStatus = this.requiredDataStatus; // Keep admin decision
    } else {
      newStatus = "pending";
    }
  }

  // Update the status
  this.requiredDataStatus = newStatus;

  console.log(`Seller ${this._id} data status updated to: ${newStatus}`);
  next();
});

// Pre-update hook for findByIdAndUpdate and similar operations
SellerSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as any;

  // Only apply to sellers
  if (update && update.role && update.role !== "seller") {
    return next();
  }

  // Only run if logo, storePhotos, or physicalAddress are being updated
  if (
    !update.logo &&
    !update.storePhotos &&
    !update.physicalAddress &&
    !update.$set?.logo &&
    !update.$set?.storePhotos &&
    !update.$set?.physicalAddress
  ) {
    return next();
  }

  // Get the current document to check existing data
  this.findOne()
    .then((doc: any) => {
      if (!doc || doc.role !== "seller") {
        return next();
      }

      // Merge current data with update data
      const mergedData = { ...doc.toObject(), ...update };

      // Check if seller has required data
      const hasLogo = mergedData.logo && mergedData.logo.imageId;
      const hasEnoughStorePhotos =
        mergedData.storePhotos && mergedData.storePhotos.length >= 2;
      const hasCompleteAddress =
        mergedData.physicalAddress &&
        mergedData.physicalAddress.country &&
        mergedData.physicalAddress.gov &&
        mergedData.physicalAddress.city &&
        mergedData.physicalAddress.region &&
        mergedData.physicalAddress.street &&
        mergedData.physicalAddress.building &&
        mergedData.physicalAddress.apartment;

      // Determine the new status
      let newStatus: "uncompleted" | "pending" | "approved" | "rejected";

      if (!hasLogo || !hasEnoughStorePhotos || !hasCompleteAddress) {
        newStatus = "uncompleted";
      } else {
        // Only set to pending if current status is not already approved/rejected
        const currentStatus =
          mergedData.requiredDataStatus || doc.requiredDataStatus;
        if (currentStatus === "approved" || currentStatus === "rejected") {
          newStatus = currentStatus; // Keep admin decision
        } else {
          newStatus = "pending";
        }
      }

      // Add requiredDataStatus to the update
      this.set({ requiredDataStatus: newStatus });

      console.log(
        `Seller ${doc._id} data status updated to: ${newStatus} (via findOneAndUpdate)`
      );
      next();
    })
    .catch((error) => {
      console.error("Error in pre-update hook:", error);
      next();
    });
});

// Discriminator
export default User.discriminator<ISeller>("seller", SellerSchema);
