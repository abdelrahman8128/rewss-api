import Ad from "../../Schema/Ad/ad.schema";
import { S3Service, UploadResult } from "../../service/s3.service";
import * as fs from "fs";
import * as path from "path";
import AdImage from "../../Schema/AdImage/Ad.image.schema";
import Model from "../../Schema/Model/model.schema";
import { IAd } from "../../Schema/Ad/ad.schema";
import mongoose, { Types } from "mongoose";
import StockService from "../Stock/service/stock.service";


export class AdService {
  private stockService: StockService;

  constructor() {
    this.stockService = new StockService();
  }

  async create(req: any): Promise<IAd> {
    const albumFiles = Array.isArray(req.files)
      ? req.files.filter((f: any) => f.fieldname === "album")
      : [];
    const thumbnailFile = Array.isArray(req.files)
      ? req.files.find((f: any) => f.fieldname === "thumbnail")
      : null;

    if (albumFiles.length < 1) {
      throw new Error(" album images are required");
    }
    if (!thumbnailFile) {
      throw new Error("A thumbnail image is required");
    }

    const adData = req.body;

    const verifiedModels = await this.verifyModels(adData.model);


    const ad = await Ad.create({
      userId: req.user._id,
      title: adData.title,
      description: adData.description,
      price: adData.price,
      condition: adData.condition,
      models: verifiedModels,
      manufacturedCountry: adData.manufacturedCountry,
    });

    // Save thumbnail image
    const thumbnailImageData = await this.saveImage(
      thumbnailFile,
      ad._id.toString()
    );

    const thumbnailImage = await AdImage.create({
      adId: ad._id,
      imageId: thumbnailImageData.key,
      imageUrl: thumbnailImageData.url,
    });

    ad.thumbnail = new Types.ObjectId(thumbnailImage._id.toString());

    for (const imageFile of albumFiles) {
      const imageData = await this.saveImage(imageFile, ad._id.toString());
      const adImage = await AdImage.create({
        adId: ad._id,
        imageId: imageData.key,
        imageUrl: imageData.url,
      });
      ad.album.push(new Types.ObjectId(adImage._id.toString()));
    }

      const stockData = {
        availableQuantity: adData.availableStock || 0,
        reservedQuantity: 0,
        soldQuantity: 0,
        minimumOrderQuantity: adData.minimumStockQuantity || 1,
        status: 'available' as const,
      };

      const stock = await this.stockService.createStock(
        ad._id,
        stockData,
        {
          userId: req.user._id,
          description: `Initial stock created for ad: ${ad.title}`,
          reason: "Ad creation",
          metadata: { adTitle: ad.title },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        }
      );

      ad.stock = stock._id;
    

    await ad.save();
    await ad.populate([
      { path: "album", select: "imageUrl" },
      {
        path: "models.model",
        populate: { path: "brand", select: "name logo -_id" },
      },
      {
        path: "thumbnail",
        select: "imageUrl",
      },
      {
        path: "stock",
        select: "totalQuantity availableQuantity reservedQuantity soldQuantity status location minimumStockLevel",
      },
    ]);

    return ad;
  }

  async update(req: any) {
    const adId = req.params.id;
    const ad = await Ad.findById(adId);
    if (!ad) {
      throw new Error("Ad not found");
    }

    if (
      req.user.role == "seller" &&
      ad.userId.toString() !== req.user._id.toString()
    ) {
      throw new Error("You are not authorized to update this ad");
    }

    const adData = req.body;

    const albumFiles = Array.isArray(req.files)
      ? req.files.filter((f: any) => f.fieldname === "album")
      : [];
    const thumbnailFile = Array.isArray(req.files)
      ? req.files.find((f: any) => f.fieldname === "thumbnail")
      : null;


    // Delete old thumbnail and album images from s3 and database
    if (thumbnailFile) {
      const oldThumbnail = await AdImage.findById(ad.thumbnail);
      if (oldThumbnail) {
        const s3Service = new S3Service();
        await s3Service.delete(oldThumbnail.imageId);
        await oldThumbnail.deleteOne();
      }
    }

    if (albumFiles.length || req.body.album) {
      const oldAlbumImages = await AdImage.find({ adId: ad._id });
      const s3Service = new S3Service();
      const oldAlbumImagesToRemove = oldAlbumImages.filter(
        (i) => !req.body.album?.includes(i._id.toString())
      );
      await Promise.all(
        oldAlbumImagesToRemove.map(async (i) => {
          await s3Service.delete(i.imageId);
          await i.deleteOne();
        })
      );
    }

    // Create new thumbnail image
    if (thumbnailFile) {
      const thumbnailImageData = await this.saveImage(
        thumbnailFile,
        ad._id.toString()
      );
      const thumbnailImage = await AdImage.create({
        adId: ad._id,
        imageId: thumbnailImageData.key,
        imageUrl: thumbnailImageData.url,
      });
      ad.thumbnail = new Types.ObjectId(thumbnailImage._id.toString());
    }

    // Create new album images
    if (albumFiles.length) {
      const imagesPromises = albumFiles.map(async (file: any) => {
        const imageData = await this.saveImage(file, ad._id.toString());
        const image = await AdImage.create({
          adId: ad._id,
          imageId: imageData.key,
          imageUrl: imageData.url,
        });
        return image;
      });
      const images = await Promise.all(imagesPromises);
      ad.album = [...ad.album, ...images.map((i) => i._id)];
    }
    // Update ad data
    if (adData.title) ad.title = adData.title;
    if (adData.description) ad.description = adData.description;
    if (adData.price) ad.price = adData.price;
    if (adData.condition) ad.condition = adData.condition;
    if (adData.manufacturedCountry)
      ad.manufacturedCountry = adData.manufacturedCountry;

    if (adData.model){
      
      const verifiedModels = await this.verifyModels(adData.model);
      

      ad.models = verifiedModels;

    }




    await ad.save();
    await ad.populate([
      { path: "album", select: "imageUrl " },
      {
        path: "models.model",
        populate: { path: "brand", select: "name logo -_id" },
      },
      {
        path: "thumbnail",
        select: "imageUrl",
      },
      {
        path: "stock",
        select: "totalQuantity availableQuantity reservedQuantity soldQuantity status location minimumStockLevel",
      },
    ]);

    return ad;
  }

  private async saveImage(file: any, adId: String): Promise<UploadResult> {
    if (!file) {
      throw new Error("image file is required");
    }

    if (!file.mimetype.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    const uploadDir = path.join(__dirname, "../../../uploads/ads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${adId}-${Date.now()}.${file.mimetype.split("/")[1]}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    // Optimize and downscale the image before upload
    try {
      const sharp = (await import("sharp")).default;

      let pipeline = sharp(filePath).rotate();

      switch (file.mimetype) {
        case "image/jpeg":
        case "image/jpg":
          pipeline = pipeline.jpeg({ quality: 70, mozjpeg: true });
          break;
        case "image/png":
          pipeline = pipeline.png({ compressionLevel: 9, quality: 70 });
          break;
        case "image/webp":
          pipeline = pipeline.webp({ quality: 70 });
          break;
        case "image/avif":
          pipeline = pipeline.avif({ quality: 70 });
          break;
        default:
          // leave format unchanged
          break;
      }

      const optimizedBuffer = await pipeline.toBuffer();
      fs.writeFileSync(filePath, optimizedBuffer);
    } catch (err) {
      console.warn(
        "Logo optimization failed, proceeding with original file:",
        err
      );
    }

    // Upload to S3
    const s3Service = new S3Service();
    const params = {
      Bucket: process.env.S3_BUCKET as string,
      Key: `ads/${fileName}`,
      Body: fs.createReadStream(filePath),
      ContentType: file.mimetype,
      ACL: "public-read", // 👈 makes it public
    };

    const uploadResult = await s3Service.upload(params);

    // Clean up local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return uploadResult; // Return the saved file name
  }

  private async verifyModels(models: string[]): Promise<{ model: Types.ObjectId }[]> {
    return (
      await Promise.all(
        models.map(async (model: string) => {
          const existsModel = await Model.findById(model);
          if (existsModel) {
            return { model: new Types.ObjectId(model) }; 
          }
          return null;
        })
      )
    ).filter(Boolean) as { model: Types.ObjectId }[];
  }

  
}
// Exporting the AdService class to be used in other parts of the application
export default AdService;
