import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
    region: "ap-northeast-2",
});

export const isProd = process.env.NODE_ENV === "prod";

const s3ProfileStorage = multerS3({
    s3: s3,
    bucket: "nutube-files/profiles",
    acl: "public-read",
});

const s3VideoStorage = multerS3({
    s3: s3,
    bucket: "nutube-files/videos",
    acl: "public-read",
});

export const uploadProfile = multer({ dest: 'uploads/userProfiles', limits: { fileSize: 3000000 }, storage: s3ProfileStorage });
export const uploadVideo = multer({ dest: 'uploads/videos', limits: { fileSize: 15000000 }, storage: s3VideoStorage });