// The Route file just maps the URL to the function in the controller.

import { Router } from 'express';
import { registerUser, loginUser, getUser } from '../controllers/userController.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', getUser);

export default router;
