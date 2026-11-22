/* 021
 * Registra as rotas de conta, dos quatro cadastros e da verificacao de saude da API
 */
import { Router } from 'express';
import authRoutes from './authRoutes';
import { createResourceRoutes } from './resourceRoutes';
import { Department } from '../models/Department';
import { Employee } from '../models/Employee';
import { Task } from '../models/Task';
import { Asset } from '../models/Asset';
const router = Router();
router.use('/auth', authRoutes);
router.use('/departments', createResourceRoutes(Department));
router.use('/employees', createResourceRoutes(Employee));
router.use('/tasks', createResourceRoutes(Task));
router.use('/assets', createResourceRoutes(Asset));
router.get('/health', (_req, res) =>
  res.json({
    status: 'ok',
    application: 'Droz Control',
  }),
);
export default router;
