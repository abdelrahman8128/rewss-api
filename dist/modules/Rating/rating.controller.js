"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingController = void 0;
const rating_service_1 = require("./rating.service");
class RatingController {
    constructor() {
        this.ratingService = new rating_service_1.RatingService();
    }
    async createRating(req, res) {
        try {
            const result = await this.ratingService.createRating(req.body);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async getProductRating(req, res) {
        try {
            const result = await this.ratingService.getProductWithRating(req.params.adId);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async getSellerRating(req, res) {
        try {
            const result = await this.ratingService.getSellerWithRating(req.params.sellerId);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async getRatingsByAd(req, res) {
        try {
            const result = await this.ratingService.getRatingsByAd(req.params.adId);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async getRatingsBySeller(req, res) {
        try {
            const result = await this.ratingService.getRatingsBySeller(req.params.sellerId);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async getRatingsByBuyer(req, res) {
        try {
            const result = await this.ratingService.getRatingsByBuyer(req.params.buyerId);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async updateRating(req, res) {
        try {
            const result = await this.ratingService.updateRating(req.params.id, req.body);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async deleteRating(req, res) {
        try {
            const result = await this.ratingService.deleteRating(req.params.id);
            res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
exports.RatingController = RatingController;
