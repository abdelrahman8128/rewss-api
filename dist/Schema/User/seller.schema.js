"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const user_schema_1 = __importDefault(require("./user.schema"));
const SellerSchema = new mongoose_1.Schema({
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
SellerSchema.pre("save", function (next) {
    if (this.role !== "seller") {
        return next();
    }
    if (!this.isModified("logo") &&
        !this.isModified("storePhotos") &&
        !this.isModified("physicalAddress")) {
        return next();
    }
    const hasLogo = this.logo && this.logo.imageId;
    const hasEnoughStorePhotos = this.storePhotos && this.storePhotos.length >= 2;
    const hasCompleteAddress = this.physicalAddress &&
        this.physicalAddress.country &&
        this.physicalAddress.gov &&
        this.physicalAddress.city &&
        this.physicalAddress.region &&
        this.physicalAddress.street &&
        this.physicalAddress.building &&
        this.physicalAddress.apartment;
    let newStatus;
    if (!hasLogo || !hasEnoughStorePhotos || !hasCompleteAddress) {
        newStatus = "uncompleted";
    }
    else {
        if (this.requiredDataStatus === "approved" ||
            this.requiredDataStatus === "rejected") {
            newStatus = this.requiredDataStatus;
        }
        else {
            newStatus = "pending";
        }
    }
    this.requiredDataStatus = newStatus;
    console.log(`Seller ${this._id} data status updated to: ${newStatus}`);
    next();
});
SellerSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    if (update && update.role && update.role !== "seller") {
        return next();
    }
    if (!update.logo &&
        !update.storePhotos &&
        !update.physicalAddress &&
        !update.$set?.logo &&
        !update.$set?.storePhotos &&
        !update.$set?.physicalAddress) {
        return next();
    }
    this.findOne()
        .then((doc) => {
        if (!doc || doc.role !== "seller") {
            return next();
        }
        const mergedData = { ...doc.toObject(), ...update };
        const hasLogo = mergedData.logo && mergedData.logo.imageId;
        const hasEnoughStorePhotos = mergedData.storePhotos && mergedData.storePhotos.length >= 2;
        const hasCompleteAddress = mergedData.physicalAddress &&
            mergedData.physicalAddress.country &&
            mergedData.physicalAddress.gov &&
            mergedData.physicalAddress.city &&
            mergedData.physicalAddress.region &&
            mergedData.physicalAddress.street &&
            mergedData.physicalAddress.building &&
            mergedData.physicalAddress.apartment;
        let newStatus;
        if (!hasLogo || !hasEnoughStorePhotos || !hasCompleteAddress) {
            newStatus = "uncompleted";
        }
        else {
            const currentStatus = mergedData.requiredDataStatus || doc.requiredDataStatus;
            if (currentStatus === "approved" || currentStatus === "rejected") {
                newStatus = currentStatus;
            }
            else {
                newStatus = "pending";
            }
        }
        this.set({ requiredDataStatus: newStatus });
        console.log(`Seller ${doc._id} data status updated to: ${newStatus} (via findOneAndUpdate)`);
        next();
    })
        .catch((error) => {
        console.error("Error in pre-update hook:", error);
        next();
    });
});
exports.default = user_schema_1.default.discriminator("seller", SellerSchema);
