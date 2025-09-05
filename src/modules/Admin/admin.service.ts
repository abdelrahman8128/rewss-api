import bcrypt from "bcryptjs";
import User from "../../Schema/User/user.schema";
import Ad from "../../Schema/Ad/ad.schema";
import Seller from "../../Schema/User/seller.schema";

export default class AdminService {
  async createSeller(req: any) {
    const { email, phoneNumber, password, name } = req.body || {};

    if (!email && !phoneNumber) {
      throw new Error("Email or phone number is required");
    }

    if (email) {
      const existsEmail = await Seller.findOne({ email });
      if (existsEmail) {
        throw new Error("This email already exists");
      }
    }

    if (phoneNumber) {
      const existsPhone = await Seller.findOne({ phoneNumber });
      if (existsPhone) {
        throw new Error("This phone number already exists");
      }
    }

    const plainPassword = password || this.generateRandomPassword(12);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Generate unique username based on name/email/phone
    const now = new Date();
    let timestamp = `${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}`;
    const base = String(name || email || phoneNumber || "seller")
      .toLowerCase()
      .replace(/\s+/g, "");
    let username = `${base}${timestamp}`;
    let usernameExists = await Seller.findOne({ username });
    while (usernameExists) {
      timestamp = `${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}${Math.floor(
        Math.random() * 100
      )}`;
      username = `${base}${timestamp}`;
      usernameExists = await Seller.findOne({ username });
    }

    const newSeller = await Seller.create({
      username,
      name: name || base,
      email,
      phoneNumber: phoneNumber || undefined,
      password: hashedPassword,
      role: "seller",
      status: "pending",
      isEmailVerified: !!email,
      isPhoneVerified: !!phoneNumber,
    });

    return { newSeller, plainPassword };
  }

  private generateRandomPassword(length = 12): string {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const digits = "23456789";
    const symbols = "!@#$%^&*-_+=?";
    const all = upper + lower + digits + symbols;

    const picks = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      digits[Math.floor(Math.random() * digits.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];

    for (let i = picks.length; i < length; i++) {
      picks.push(all[Math.floor(Math.random() * all.length)]);
    }

    // shuffle
    for (let i = picks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [picks[i], picks[j]] = [picks[j], picks[i]];
    }
    return picks.join("");
  }

  async changeAdStatus(adId: string, status: string) {
    const allowed = ["active", "pending", "deleted"];
    if (!allowed.includes(status)) {
      throw new Error(`Invalid status. Allowed: ${allowed.join(", ")}`);
    }
    const updated = await Ad.findOneAndUpdate(
      { _id: adId },
      { $set: { status } },
      { new: true }
    ).populate([
      { path: "thumbnail", select: "imageUrl" },
      {
        path: "models.model",
        populate: { path: "brand", select: "name logo -_id" },
      },
      {
        path: "stock",
        select:
          "totalQuantity availableQuantity reservedQuantity soldQuantity status location minimumStockLevel",
      },
      { path: "category" },
    ]);

    if (!updated) {
      throw new Error("Ad not found");
    }
    return updated;
  }

  async listAds(req: any) {
    const {
      search,
      model,
      seller,
      stockStatus,
      condition,
      category,
      minPrice,
      maxPrice,
      status, // can be a single value or comma-separated values
      sortBy = "date",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = req.query || {};

    const filter: any = {};

    // Default to pending + deleted if no status provided
    const defaultStatuses = ["pending", "deleted"];
    if (status) {
      const statuses = String(status)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (statuses.length === 1) {
        filter.status = statuses[0];
      } else if (statuses.length > 1) {
        filter.status = { $in: statuses };
      }
    } else {
      filter.status = { $in: defaultStatuses };
    }

    if (search) {
      const regex = new RegExp(String(search), "i");
      filter.$or = [{ title: regex }, { slug: regex }, { description: regex }];
    }

    if (category) {
      try {
        filter.category = new (require("mongoose").Types.ObjectId)(
          String(category)
        );
      } catch (_) {}
    }

    if (model) {
      try {
        filter["models.model"] = new (require("mongoose").Types.ObjectId)(
          String(model)
        );
      } catch (_) {}
    }

    if (seller) {
      try {
        filter.userId = new (require("mongoose").Types.ObjectId)(
          String(seller)
        );
      } catch (_) {}
    }

    if (stockStatus) {
      filter.stockStatus = String(stockStatus);
    }

    if (condition) {
      filter.condition = String(condition);
    }

    if (minPrice || maxPrice) {
      filter.price = {} as any;
      if (minPrice) (filter.price as any).$gte = Number(minPrice);
      if (maxPrice) (filter.price as any).$lte = Number(maxPrice);
    }

    const sort: any = {};
    const sortField = String(sortBy) === "price" ? "price" : "createdAt";
    sort[sortField] = String(sortOrder) === "asc" ? 1 : -1;

    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNumber - 1) * pageSize;

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
          {
            path: "stock",
            select:
              "totalQuantity availableQuantity reservedQuantity soldQuantity status location minimumStockLevel",
          },
          { path: "category" },
        ])
        .sort(sort)
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
}
