/* 020
 * deixa cadastro e login publicos e protege a consulta e edicao do perfil
 */
import { Router } from 'express';
import { login, register, me, updateMe } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';
const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.put('/me', authenticate, updateMe);
export default router;
