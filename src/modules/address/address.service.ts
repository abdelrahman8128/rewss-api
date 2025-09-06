import { Types } from "mongoose";
import Address, { IAddress } from "../../Schema/Address/address.schema";
import { CreateAddressDto, UpdateAddressDto } from "./DTO/address.dto";

export class AddressService {
  // Create a new address
  async createAddress(
    userId: string,
    addressData: CreateAddressDto
  ): Promise<IAddress> {
    // If this is set as default, unset other default addresses for this user
    if (addressData.isDefault) {
      await Address.updateMany(
        { user: new Types.ObjectId(userId), isDefault: true },
        { isDefault: false }
      );
    }

    const address = new Address({
      ...addressData,
      user: new Types.ObjectId(userId),
    });

    return await address.save();
  }

  // Get all addresses for a user
  async getUserAddresses(userId: string): Promise<IAddress[]> {
    return await Address.find({ user: new Types.ObjectId(userId) })
      .sort({ isDefault: -1, createdAt: -1 })
      .populate("user", "name email phoneNumber");
  }

  // Get a specific address by ID
  async getAddressById(
    addressId: string,
    userId: string
  ): Promise<IAddress | null> {
    return await Address.findOne({
      _id: new Types.ObjectId(addressId),
      user: new Types.ObjectId(userId),
    }).populate("user", "name email phoneNumber");
  }

  // Update an address
  async updateAddress(
    addressId: string,
    userId: string,
    updateData: UpdateAddressDto
  ): Promise<IAddress | null> {
    // If this is set as default, unset other default addresses for this user
    if (updateData.isDefault) {
      await Address.updateMany(
        {
          user: new Types.ObjectId(userId),
          isDefault: true,
          _id: { $ne: new Types.ObjectId(addressId) },
        },
        { isDefault: false }
      );
    }

    return await Address.findOneAndUpdate(
      { _id: new Types.ObjectId(addressId), user: new Types.ObjectId(userId) },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("user", "name email phoneNumber");
  }

  // Delete an address
  async deleteAddress(addressId: string, userId: string): Promise<boolean> {
    const result = await Address.findOneAndDelete({
      _id: new Types.ObjectId(addressId),
      user: new Types.ObjectId(userId),
    });

    if (result && result.isDefault) {
      // If we deleted the default address, set another address as default
      const remainingAddresses = await Address.find({
        user: new Types.ObjectId(userId),
      });
      if (remainingAddresses.length > 0) {
        await Address.findByIdAndUpdate(remainingAddresses[0]._id, {
          isDefault: true,
        });
      }
    }

    return !!result;
  }

  // Set an address as default
  async setDefaultAddress(
    addressId: string,
    userId: string
  ): Promise<IAddress | null> {
    // First, unset all default addresses for this user
    await Address.updateMany(
      { user: new Types.ObjectId(userId), isDefault: true },
      { isDefault: false }
    );

    // Then set the specified address as default
    return await Address.findOneAndUpdate(
      { _id: new Types.ObjectId(addressId), user: new Types.ObjectId(userId) },
      { isDefault: true },
      { new: true, runValidators: true }
    ).populate("user", "name email phoneNumber");
  }

  // Get default address for a user
  async getDefaultAddress(userId: string): Promise<IAddress | null> {
    return await Address.findOne({
      user: new Types.ObjectId(userId),
      isDefault: true,
    }).populate("user", "name email phoneNumber");
  }

  // Get address statistics
  async getAddressStats(): Promise<{
    totalAddresses: number;
    addressesByCountry: Array<{ country: string; count: number }>;
    addressesByGov: Array<{ gov: string; count: number }>;
  }> {
    const totalAddresses = await Address.countDocuments();

    const addressesByCountry = await Address.aggregate([
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { country: "$_id", count: 1, _id: 0 } },
    ]);

    const addressesByGov = await Address.aggregate([
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
