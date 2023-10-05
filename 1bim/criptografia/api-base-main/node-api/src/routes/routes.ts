import { Router } from 'express';
const fb = require('fibonacci');

import * as ApiController from '../controllers/apiController';

const router = Router();

router.post('/registerUser', ApiController.register);

router.get('/listAll', ApiController.listAll);







export default router;
