"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressService = void 0;
const mongoose_1 = require("mongoose");
const address_schema_1 = __importDefault(require("../../Schema/Address/address.schema"));
class AddressService {
    async createAddress(userId, addressData) {
        if (addressData.isDefault) {
            await address_schema_1.default.updateMany({ user: new mongoose_1.Types.ObjectId(userId), isDefault: true }, { isDefault: false });
        }
        const address = new address_schema_1.default({
            ...addressData,
            user: new mongoose_1.Types.ObjectId(userId),
        });
        return await address.save();
    }
    async getUserAddresses(userId) {
        return await address_schema_1.default.find({ user: new mongoose_1.Types.ObjectId(userId) })
            .sort({ isDefault: -1, createdAt: -1 })
            .populate("user", "name email phoneNumber");
    }
    async getAddressById(addressId, userId) {
        return await address_schema_1.default.findOne({
            _id: new mongoose_1.Types.ObjectId(addressId),
            user: new mongoose_1.Types.ObjectId(userId),
        }).populate("user", "name email phoneNumber");
    }
    async updateAddress(addressId, userId, updateData) {
        if (updateData.isDefault) {
            await address_schema_1.default.updateMany({
                user: new mongoose_1.Types.ObjectId(userId),
                isDefault: true,
                _id: { $ne: new mongoose_1.Types.ObjectId(addressId) },
            }, { isDefault: false });
        }
        return await address_schema_1.default.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(addressId), user: new mongoose_1.Types.ObjectId(userId) }, { $set: updateData }, { new: true, runValidators: true }).populate("user", "name email phoneNumber");
    }
    async deleteAddress(addressId, userId) {
        const result = await address_schema_1.default.findOneAndDelete({
            _id: new mongoose_1.Types.ObjectId(addressId),
            user: new mongoose_1.Types.ObjectId(userId),
        });
        if (result && result.isDefault) {
            const remainingAddresses = await address_schema_1.default.find({
                user: new mongoose_1.Types.ObjectId(userId),
            });
            if (remainingAddresses.length > 0) {
                await address_schema_1.default.findByIdAndUpdate(remainingAddresses[0]._id, {
                    isDefault: true,
                });
            }
        }
        return !!result;
    }
    async setDefaultAddress(addressId, userId) {
        await address_schema_1.default.updateMany({ user: new mongoose_1.Types.ObjectId(userId), isDefault: true }, { isDefault: false });
        return await address_schema_1.default.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(addressId), user: new mongoose_1.Types.ObjectId(userId) }, { isDefault: true }, { new: true, runValidators: true }).populate("user", "name email phoneNumber");
    }
    async getDefaultAddress(userId) {
        return await address_schema_1.default.findOne({
            user: new mongoose_1.Types.ObjectId(userId),
            isDefault: true,
        }).populate("user", "name email phoneNumber");
    }
    async getAddressStats() {
        const totalAddresses = await address_schema_1.default.countDocuments();
        const addressesByCountry = await address_schema_1.default.aggregate([
            { $group: { _id: "$country", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { country: "$_id", count: 1, _id: 0 } },
        ]);
        const addressesByGov = await address_schema_1.default.aggregate([
            { $group: { _id: "$gov", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { gov: "$_id", count: 1, _id: 0 } },
        ]);
        return {
            totalAddresses,
            addressesByCountry,
            addressesByGov,
        };
    }
}
exports.AddressService = AddressService;
