import express from 'express';
import authMiddleware from '../middlewares/authenticate.js';
import upload from '../middlewares/upload.js';
import uploadControllers from '../controllers/upload.controllers.js';

const router = express.Router();

router.post(
  '/image',
  authMiddleware.protect,
  upload.single('file'),
  uploadControllers.uploadImage,
);

router.post(
  '/images',
  authMiddleware.protect,
  upload.array('files', 10),
  uploadControllers.uploadImages,
);

export default router;
