"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_schema_1 = __importDefault(require("../../Schema/User/user.schema"));
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res
                .status(401)
                .json({ message: "Authorization token is required" });
        }
        const tokenString = Array.isArray(token) ? token[0] : token;
        const decoded = jsonwebtoken_1.default.verify(tokenString, process.env.JWT_SECRET || "default_secret");
        const user = await user_schema_1.default.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        req.user = {
            ...user.toObject(),
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ message: "Invalid token" });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ message: "Token expired" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
    return;
};
exports.authMiddleware = authMiddleware;
const authorize = (roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                await new Promise((resolve, reject) => {
                    (0, exports.authMiddleware)(req, res, (err) => {
                        if (err)
                            reject(err);
                        else
                            resolve();
                    });
                });
                if (res.headersSent) {
                    return;
                }
            }
            if (!roles.includes(req.user.role)) {
                return res
                    .status(403)
                    .json({ message: "Access forbidden: Insufficient permissions" });
            }
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return res.status(401).json({ message: "Invalid token" });
            }
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                return res.status(401).json({ message: "Token expired" });
            }
            return res.status(500).json({ message: "Internal server error" });
        }
        return;
    };
};
exports.authorize = authorize;
