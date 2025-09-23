"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ioSocket = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
require("./config/dotenv.config");
require("./config/mongodb.config");
require("reflect-metadata");
const socket_io_2 = require("./common/socket/socket.io");
const morgan_1 = __importDefault(require("morgan"));
const app_route_1 = __importDefault(require("./app.route"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
const server = http_1.default.createServer(app);
exports.ioSocket = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 10 * 1024 * 1024,
    transports: ["websocket", "polling"],
});
(0, socket_io_2.socketFunction)();
app.use((0, cors_1.default)({
    origin: "*",
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
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
