"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("./config/dotenv.config");
require("./config/mongodb.config");
require("reflect-metadata");
const morgan_1 = __importDefault(require("morgan"));
const app_route_1 = __importDefault(require("./app.route"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)({
    origin: '*',
}));
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
(0, app_route_1.default)(app);
app.get("/", (req, res) => {
    res.send("Hello from rewss-api!");
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
