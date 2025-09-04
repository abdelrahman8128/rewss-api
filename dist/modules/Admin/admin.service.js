"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_schema_1 = __importDefault(require("../../Schema/User/user.schema"));
const ad_schema_1 = __importDefault(require("../../Schema/Ad/ad.schema"));
class AdminService {
    async createSeller(req) {
        const { email, phoneNumber, password, name } = req.body || {};
        if (!email && !phoneNumber) {
            throw new Error("Email or phone number is required");
        }
        if (email) {
            const existsEmail = await user_schema_1.default.findOne({ email });
            if (existsEmail) {
                throw new Error("This email already exists");
            }
        }
        if (phoneNumber) {
            const existsPhone = await user_schema_1.default.findOne({ phoneNumber });
            if (existsPhone) {
                throw new Error("This phone number already exists");
            }
        }
        const plainPassword = password || this.generateRandomPassword(12);
        const hashedPassword = await bcryptjs_1.default.hash(plainPassword, 10);
        const now = new Date();
        let timestamp = `${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}`;
        const base = String(name || email || phoneNumber || "seller")
            .toLowerCase()
            .replace(/\s+/g, "");
        let username = `${base}${timestamp}`;
        let usernameExists = await user_schema_1.default.findOne({ username });
        while (usernameExists) {
            timestamp = `${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}${now.getMilliseconds()}${Math.floor(Math.random() * 100)}`;
            username = `${base}${timestamp}`;
            usernameExists = await user_schema_1.default.findOne({ username });
        }
        const newSeller = await user_schema_1.default.create({
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
    generateRandomPassword(length = 12) {
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
        for (let i = picks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [picks[i], picks[j]] = [picks[j], picks[i]];
        }
        return picks.join("");
    }
    async changeAdStatus(adId, status) {
        const allowed = ["active", "pending", "deleted"];
        if (!allowed.includes(status)) {
            throw new Error(`Invalid status. Allowed: ${allowed.join(", ")}`);
        }
        const updated = await ad_schema_1.default.findOneAndUpdate({ _id: adId }, { $set: { status } }, { new: true }).populate([
            { path: "thumbnail", select: "imageUrl" },
            {
                path: "models.model",
                populate: { path: "brand", select: "name logo -_id" },
            },
            {
                path: "stock",
                select: "totalQuantity availableQuantity reservedQuantity soldQuantity status location minimumStockLevel",
            },
            { path: "category" },
        ]);
        if (!updated) {
            throw new Error("Ad not found");
        }
        return updated;
    }
    async listAds(req) {
        const { search, model, seller, stockStatus, condition, category, minPrice, maxPrice, status, sortBy = "date", sortOrder = "desc", page = 1, limit = 20, } = req.query || {};
        const filter = {};
        const defaultStatuses = ["pending", "deleted"];
        if (status) {
            const statuses = String(status)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            if (statuses.length === 1) {
                filter.status = statuses[0];
            }
            else if (statuses.length > 1) {
                filter.status = { $in: statuses };
            }
        }
        else {
            filter.status = { $in: defaultStatuses };
        }
        if (search) {
            const regex = new RegExp(String(search), "i");
            filter.$or = [{ title: regex }, { slug: regex }, { description: regex }];
        }
        if (category) {
            try {
                filter.category = new (require("mongoose").Types.ObjectId)(String(category));
            }
            catch (_) { }
        }
        if (model) {
            try {
                filter["models.model"] = new (require("mongoose").Types.ObjectId)(String(model));
            }
            catch (_) { }
        }
        if (seller) {
            try {
                filter.userId = new (require("mongoose").Types.ObjectId)(String(seller));
            }
            catch (_) { }
        }
        if (stockStatus) {
            filter.stockStatus = String(stockStatus);
        }
        if (condition) {
            filter.condition = String(condition);
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice)
                filter.price.$gte = Number(minPrice);
            if (maxPrice)
                filter.price.$lte = Number(maxPrice);
        }
        const sort = {};
        const sortField = String(sortBy) === "price" ? "price" : "createdAt";
        sort[sortField] = String(sortOrder) === "asc" ? 1 : -1;
        const pageNumber = Math.max(1, Number(page) || 1);
        const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
        const skip = (pageNumber - 1) * pageSize;
        const [items, total] = await Promise.all([
            ad_schema_1.default.find(filter)
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
                    select: "totalQuantity availableQuantity reservedQuantity soldQuantity status location minimumStockLevel",
                },
                { path: "category" },
            ])
                .sort(sort)
                .skip(skip)
                .limit(pageSize),
            ad_schema_1.default.countDocuments(filter),
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
exports.default = AdminService;
