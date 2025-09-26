"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
exports.default = (app) => {
    app.get("/socket-test", (req, res) => {
        res.sendFile(path_1.default.join(__dirname, "../socket-test.html"));
    });
    app.use("/api/v1/auth", require("./modules/authenticaion/auth.route").default);
    app.use("/api/v1/otp", require("./modules/otp/otp.route").default);
    app.use("/api/v1/brand", require("./modules/brand/brand.route").default);
    app.use("/api/v1/model", require("./modules/model/model.route").default);
    app.use("/api/v1/category", require("./modules/category/category.route").default);
    app.use("/api/v1/ad", require("./modules/Ad/ad.route").default);
    app.use("/api/v1/stock", require("./modules/Stock/stock.route").default);
    app.use("/api/v1/activity", require("./modules/ActivityLog/activity-log.route").default);
    app.use("/api/v1/admin", require("./modules/Admin/admin.route").default);
    app.use("/api/v1/ban", require("./modules/ban/ban.route").default);
    app.use("/api/v1/user", require("./modules/user/user.route").default);
    app.use("/api/v1/address", require("./modules/address/address.route").default);
    app.use("/api/v1/question", require("./modules/Question/question.route").default);
    app.use("/api/v1/chat", require("./modules/chat/chat.route").default);
    app.use("/api/v1/cart", require("./modules/Cart/cart.route").default);
};
