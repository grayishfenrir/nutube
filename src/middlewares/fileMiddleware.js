import multer from 'multer';

export const uploadProfile = multer({ dest: 'uploads/userProfiles', limits: { fileSize: 3000000 } });
export const uploadVideo = multer({ dest: 'uploads/videos', limits: { fileSize: 15000000 } });