"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsersController = void 0;
const user_service_1 = require("../user.service");
const userService = new user_service_1.UserService();
const searchUsersController = async (req, res) => {
    try {
        const { search, status, role, page, limit } = req.query;
        const result = await userService.searchUsers({
            search: search,
            status: status,
            role: role,
            page: Number(page),
            limit: Number(limit),
        });
        res.status(200).json({
            message: "Users search completed successfully",
            data: result,
        });
    }
    catch (error) {
        console.error("Error searching users:", error);
        res.status(400).json({
            message: error.message || "Failed to search users",
        });
    }
};
exports.searchUsersController = searchUsersController;
