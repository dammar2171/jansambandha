import express from 'express';
import wardControllers from '../controllers/ward.controllers.js';

const router = express.Router();

// Public: list active wards (used by citizen registration and dropdowns)
router.get('/', wardControllers.listWards);

export default router;
