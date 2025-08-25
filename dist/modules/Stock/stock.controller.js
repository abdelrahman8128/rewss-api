"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStockController = exports.getStockController = void 0;
var get_stock_controller_1 = require("./controllers/get.stock.controller");
Object.defineProperty(exports, "getStockController", { enumerable: true, get: function () { return get_stock_controller_1.getStockController; } });
var seller_update_stock_controller_1 = require("./controllers/seller-update.stock.controller");
Object.defineProperty(exports, "updateStockController", { enumerable: true, get: function () { return seller_update_stock_controller_1.updateStockController; } });
