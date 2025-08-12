import { S3Client, PutObjectCommand, DeleteObjectCommand, type ObjectCannedACL } from '@aws-sdk/client-s3';
import type { Readable } from 'stream';
import {s3} from '../config/s3.config'; // Adjust the import path as necessary
// src/service/s3.service.ts

export interface S3ServiceOptions {
    bucket: string;
    region?: string;
    endpoint?: string;
    forcePathStyle?: boolean;
    credentials?: {
        accessKeyId: string;
        secretAccessKey: string;
        sessionToken?: string;
    };
}


export interface UploadResult {
    key: string;
    etag?: string;
    url: string;
}

export class S3Service {
    private readonly s3: S3Client;
    private readonly bucket: string;
    private readonly endpoint?: string;
    private readonly forcePathStyle: boolean;
    private readonly region?: string;

    constructor(opts?: Partial<S3ServiceOptions>) {
        // Take bucket name and region from environment only
        const region = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION;
        const bucket = process.env.S3_BUCKET ?? '';

        if (!bucket) {
            throw new Error('S3 bucket is required. Set S3_BUCKET env var.');
        }

        this.bucket = bucket;
        this.region = region;
        this.endpoint = opts?.endpoint ?? process.env.S3_ENDPOINT;
        this.forcePathStyle = opts?.forcePathStyle ?? (process.env.S3_FORCE_PATH_STYLE === 'true');

        // Initialize the S3 client
        this.s3 = s3;
    }

    // Uploads an object to S3 and returns its key, ETag, and a computed URL.
    async upload(params: any): Promise<UploadResult> {
       
    let result;
    try {
      result = await s3.send(new PutObjectCommand(params));
    } finally {
      // This will run even if an error occurs above!
      try {
       // fs.unlinkSync(localFilePath);
      } catch (deleteErr) {
        // لو فيه مشكلة في الحذف، ممكن تسجلها أو تتجاهلها حسب الحاجة
        console.error("Couldn't delete file:", deleteErr);
      }
    }

        const key = params.Key.replace(/^\/+/, '');
        const url = this.getObjectUrl(key);

        return {
            key,
            etag: result.ETag,
            url,
        };
    
    }

    // Deletes an object by key. Resolves when deletion request is accepted.
    async delete(key: string): Promise<void> {
        await this.s3.send(
            new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }),
        );
    }

    // Builds a public URL for the object (works for public buckets or compatible S3 endpoints).
    getObjectUrl(key: string): string {
        const normalizedKey = key.replace(/^\/+/, '');
        if (this.endpoint) {
            const base = this.endpoint.replace(/\/+$/, '');
            if (this.forcePathStyle) {
                return `${base}/${this.bucket}/${encodeURI(normalizedKey)}`;
            }
            const [scheme, rest] = base.split('://');
            return `${scheme}://${this.bucket}.${rest}/${encodeURI(normalizedKey)}`;
        }

        const host =
            this.region && this.region !== 'us-east-1'
                ? `s3.${this.region}.amazonaws.com`
                : 's3.amazonaws.com';

        return `https://${this.bucket}.${host}/${encodeURI(normalizedKey)}`;
    }
}

export default S3Service;