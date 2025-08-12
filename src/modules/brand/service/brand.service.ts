import { body } from "express-validator";
import { Int64 } from "./../../../../node_modules/@smithy/eventstream-codec/dist-types/Int64.d";
import Brand, { IBrand } from "../../../Schema/Brand/brand.schema";
import { Types } from "mongoose";
import { S3Service } from "../../../service/s3.service";
import * as fs from "fs";
import * as path from "path";

export interface CreateBrandInput {
  name: string;
  country: string;
  logo: File;
}

export interface UpdateBrandInput {
  name?: string;
  country?: string;
  logo?: string;
}

export interface ListBrandsQuery {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
}

export interface PaginatedBrands {
  data: IBrand[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export class BrandService {
  async create(req: any): Promise<IBrand | null> {
    const name = req.body.name.trim();

    const exists = await Brand.findOne({ name });
    if (exists) throw new Error("Brand already exists");

    const logoFileName = await this.saveLogo(req); // Save the logo file and get the path

    // إنشاء البراند
    return await Brand.create({
      name,
      logo: logoFileName, // نخزن الاسم أو المسار
    });
  }

  async getById(id: string): Promise<IBrand | null> {
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid brand id");
    return Brand.findById(id);
  }

  async list(query: ListBrandsQuery = {}): Promise<PaginatedBrands> {
    const { page = 1, limit = 20, search } = query;

    // Ensure numeric values for pagination to satisfy MongoDB $skip/$limit
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);

    const filter: Record<string, any> = {};
    if (search) {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    const skip = (pageNum - 1) * limitNum;

    const [agg] = await Brand.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNum },
            {
              $project: {
                name: 1,
                logo: 1,
                country: 1,
                _id: 1,
                // createdAt is excluded from projection
              },
            },
          ],
          meta: [{ $count: "total" }],
        },
      },
    ]);

    const data = agg?.data ?? [];
    const total = agg?.meta?.[0]?.total ?? 0;

    return {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
      data,
    };
  }

  async update(req: any): Promise<IBrand | null> {
    const id = req.params.id;
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid brand id");

    const brand = await Brand.findById(id);
    if (!brand) throw new Error("Brand not found");

    const update: Record<string, any> = {};

    if (req.body.name) {
      const name = req.body.name.trim();
      const exists = await Brand.findOne({ name, _id: { $ne: id } });
      if (exists) throw new Error("Brand name already in use");
      update.name = name;
    }

    const file = Array.isArray(req.files)
      ? req.files.find((f: any) => f.fieldname === "logo")
      : null;

    if (file) {
      await this.deleteBrandLogo(id);
      const logoFileName = await this.saveLogo(req);
      update.logo = logoFileName;
    }

    if (!Object.keys(update).length) return Brand.findById(id);

    return Brand.findByIdAndUpdate(id, update, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) throw new Error("Invalid brand id");
    const res = await Brand.findByIdAndDelete(id);
    return !!res;
  }

  private async saveLogo(req: any): Promise<string> {
    // Change return type to Promise<string>

    const file = Array.isArray(req.files)
      ? req.files.find((f: any) => f.fieldname === "logo")
      : null;

    if (!file) {
      throw new Error("Logo file is required");
    }

    if (!file.mimetype.startsWith("image/")) {
      throw new Error("Logo must be an image");
    }

    const uploadDir = path.join(__dirname, "../../../uploads/brands");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const logoFileName = `${req.body.name}-logo-${Date.now()}.${
      file.mimetype.split("/")[1]
    }`;
    const logoPath = path.join(uploadDir, logoFileName);

    fs.writeFileSync(logoPath, file.buffer);

    // Optimize and downscale the image before upload
    try {
      const sharp = (await import("sharp")).default;

      const MAX_WIDTH = 80;
      const MAX_HEIGHT = 80;

      let pipeline = sharp(logoPath).rotate().resize({
        width: MAX_WIDTH,
        height: MAX_HEIGHT,
        fit: "inside",
        withoutEnlargement: true,
      });

      switch (file.mimetype) {
        case "image/jpeg":
        case "image/jpg":
          pipeline = pipeline.jpeg({ quality: 50, mozjpeg: true });
          break;
        case "image/png":
          pipeline = pipeline.png({ compressionLevel: 9, palette: true });
          break;
        case "image/webp":
          pipeline = pipeline.webp({ quality: 80 });
          break;
        case "image/avif":
          pipeline = pipeline.avif({ quality: 50 });
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
      Key: `brands/${logoFileName}`,
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

    return uploadResult.url; // Return the saved file name
  }

  async deleteBrandLogo(id: string): Promise<boolean> {
    const brand = await Brand.findById(id);
    if (!brand || !brand.logo) {
      throw new Error("Brand not found or logo is missing");
    }

    // Extract the key from the S3 URL
    const logoUrl = brand.logo;
    const urlParts = logoUrl.split(".com/");
    if (urlParts.length < 2) {
      throw new Error("Invalid logo URL format");
    }

    const logoKey = urlParts[1]; // This will be "brands/file-name.png"
    const s3Service = new S3Service();
    await s3Service.delete(logoKey);

    // Update the brand document
    brand.logo = "";
    await brand.save();

    console.log(`Brand logo removed for brand ID: ${id}`);

    return true;
  }
}

const brandService = new BrandService();
export default brandService;
