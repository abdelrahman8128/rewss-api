import { Request, Response } from "express";
import { RatingService } from "./rating.service";
import { IRating } from "../../Schema/Rating/rating.schema";

export class RatingController {
  private ratingService: RatingService;

  constructor() {
    this.ratingService = new RatingService();
  }

  async createRating(req: Request, res: Response) {
    try {
      const result = await this.ratingService.createRating(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getProductRating(req: Request, res: Response) {
    try {
      const result = await this.ratingService.getProductWithRating(
        req.params.adId
      );
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getSellerRating(req: Request, res: Response) {
    try {
      const result = await this.ratingService.getSellerWithRating(
        req.params.sellerId
      );
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getRatingsByAd(req: Request, res: Response) {
    try {
      const result = await this.ratingService.getRatingsByAd(req.params.adId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getRatingsBySeller(req: Request, res: Response) {
    try {
      const result = await this.ratingService.getRatingsBySeller(
        req.params.sellerId
      );
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getRatingsByBuyer(req: Request, res: Response) {
    try {
      const result = await this.ratingService.getRatingsByBuyer(
        req.params.buyerId
      );
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateRating(req: Request, res: Response) {
    try {
      const result = await this.ratingService.updateRating(
        req.params.id,
        req.body
      );
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteRating(req: Request, res: Response) {
    try {
      const result = await this.ratingService.deleteRating(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
