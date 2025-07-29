"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (app) => {
    app.use("/api/v1/auth", require("./modules/authenticaion/auth.route").default);
};
