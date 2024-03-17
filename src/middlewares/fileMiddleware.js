import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';



const s3 = new S3Client({
    region: "ap-northeast-2",
});

const multerS3Storage = multerS3({
    s3: s3,
    bucket: "nutube-files",
    acl: "public-read",
});


export const uploadProfile = multer({ dest: 'uploads/userProfiles', limits: { fileSize: 3000000 }, storage: multerS3Storage });
export const uploadVideo = multer({ dest: 'uploads/videos', limits: { fileSize: 15000000 }, storage: multerS3Storage });