"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cart = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const CartSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            productId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Ad", required: true },
            quantity: { type: Number, required: true, min: 1, default: 1 },
        },
    ],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
CartSchema.index({ userId: 1, sellerId: 1 }, { unique: true });
CartSchema.virtual("totalCost").get(function () {
    if (!this.items || this.items.length === 0)
        return 0;
    return this.items.reduce((total, item) => {
        if (item.productId &&
            typeof item.productId === "object" &&
            "price" in item.productId) {
            return total + item.productId.price * item.quantity;
        }
        return total;
    }, 0);
});
CartSchema.post("find", function (docs, next) {
    if (!docs)
        return next();
    const documents = Array.isArray(docs) ? docs : [docs];
    documents.forEach((doc) => {
        if (doc && doc.items) {
            doc.totalCost = doc.items.reduce((total, item) => {
                if (item.productId && item.productId.price && item.quantity) {
                    return total + item.productId.price * item.quantity;
                }
                return total;
            }, 0);
            doc.totalCost = doc.totalCost || 0;
        }
    });
    next();
});
CartSchema.post("findOne", function (doc, next) {
    if (doc && doc.items) {
        doc.totalCost = doc.items.reduce((total, item) => {
            if (item.productId && item.productId.price && item.quantity) {
                return total + item.productId.price * item.quantity;
            }
            return total;
        }, 0);
        doc.totalCost = doc.totalCost || 0;
    }
    next();
});
CartSchema.post("findOneAndUpdate", function (doc, next) {
    if (doc && doc.items) {
        doc.totalCost = doc.items.reduce((total, item) => {
            if (item.productId && item.productId.price && item.quantity) {
                return total + item.productId.price * item.quantity;
            }
            return total;
        }, 0);
        doc.totalCost = doc.totalCost || 0;
    }
    next();
});
exports.Cart = (0, mongoose_2.model)("Cart", CartSchema);
