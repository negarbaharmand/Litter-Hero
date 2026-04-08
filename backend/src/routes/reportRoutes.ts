import { Router } from 'express';
import { getAllReports, createReport } from '../controllers/reportController.js';

const router = Router();

router.get('/', getAllReports);

router.post('/', createReport);

export default router;