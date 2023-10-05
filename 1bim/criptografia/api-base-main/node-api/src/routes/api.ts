import { Router } from 'express';

import * as apiController from '../controllers/apiController';

const router = Router();

router.post('/registerUser', apiController.register);
router.post('/login', apiController.login);
router.get('/listAll', apiController.listAll);
router.get('/forgotPassword/:email', apiController.forgotPassword);


export default router;