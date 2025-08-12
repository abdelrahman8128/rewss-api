"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_config_1 = require("../config/s3.config");
class S3Service {
    constructor(opts) {
        const region = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION;
        const bucket = process.env.S3_BUCKET ?? '';
        if (!bucket) {
            throw new Error('S3 bucket is required. Set S3_BUCKET env var.');
        }
        this.bucket = bucket;
        this.region = region;
        this.endpoint = opts?.endpoint ?? process.env.S3_ENDPOINT;
        this.forcePathStyle = opts?.forcePathStyle ?? (process.env.S3_FORCE_PATH_STYLE === 'true');
    }
    async upload(params) {
        let result;
        try {
            result = await s3_config_1.s3.send(new client_s3_1.PutObjectCommand(params));
        }
        finally {
            try {
            }
            catch (deleteErr) {
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
    async delete(key) {
        const normalizedKey = key.replace(/^\/+/, '');
        await this.s3.send(new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucket,
            Key: normalizedKey,
        }));
    }
    getObjectUrl(key) {
        const normalizedKey = key.replace(/^\/+/, '');
        if (this.endpoint) {
            const base = this.endpoint.replace(/\/+$/, '');
            if (this.forcePathStyle) {
                return `${base}/${this.bucket}/${encodeURI(normalizedKey)}`;
            }
            const [scheme, rest] = base.split('://');
            return `${scheme}://${this.bucket}.${rest}/${encodeURI(normalizedKey)}`;
        }
        const host = this.region && this.region !== 'us-east-1'
            ? `s3.${this.region}.amazonaws.com`
            : 's3.amazonaws.com';
        return `https://${this.bucket}.${host}/${encodeURI(normalizedKey)}`;
    }
}
exports.S3Service = S3Service;
exports.default = S3Service;
