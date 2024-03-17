import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';

const s3 = new aws.S3({
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET
    }
});

const multerS3Storage = multerS3({
    s3: s3,
    bucket: 'nutube-files',
})


export const uploadProfile = multer({ dest: 'uploads/userProfiles', limits: { fileSize: 3000000 }, storage: multerS3Storage });
export const uploadVideo = multer({ dest: 'uploads/videos', limits: { fileSize: 15000000 }, storage: multerS3Storage });