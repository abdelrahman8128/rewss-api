import Ad from "../../Schema/Ad/ad.schema"
import { S3Service, UploadResult } from "../../service/s3.service";
import * as fs from "fs";
import * as path from "path";
import AdImage from "../../Schema/productImage/product.image.schema";


export class AdService {
 
    async create (req:any){

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
        const ad = await Ad.create({
            title: adData.title,
            description: adData.description,
            price: adData.price,
            condition: adData.condition,
            models: adData.models,
            manufacturedCountry: adData.manufacturedCountry,
        });

        // Save thumbnail image
        const thumbnailImageData = await this.saveImage(thumbnailFile, ad._id.toString());
      
        const thumbnailImage = await AdImage.create({
            adId: ad._id,
            imageId: thumbnailImageData.key,
            imageUrl: thumbnailImageData.url,
        });
        
        ad.thumbnail = thumbnailImage._id;


        await ad.save();


    }
    

   

 private async saveImage(file: any,adId:String): Promise<UploadResult> {
    

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

    const logoFileName = `${adId}-logo-${Date.now()}.${
      file.mimetype.split("/")[1]
    }`;
    const logoPath = path.join(uploadDir, logoFileName);

    fs.writeFileSync(logoPath, file.buffer);

    // Optimize and downscale the image before upload
    try {
      const sharp = (await import("sharp")).default;

      const MAX_WIDTH = 80;
      const MAX_HEIGHT = 80;

    let pipeline = sharp(logoPath).rotate();

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
      fs.writeFileSync(logoPath, optimizedBuffer);
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
      Key: `ads/${logoFileName}`,
      Body: fs.createReadStream(logoPath),
      ContentType: file.mimetype,
      ACL: "public-read", // 👈 makes it public
    };

    const uploadResult = await s3Service.upload(params);

    console.log("S3 Upload Result:", uploadResult);

    // Clean up local file after upload
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
    }

    return uploadResult; // Return the saved file name
  }
}

// Exporting the AdService class to be used in other parts of the application
export default AdService;