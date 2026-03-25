import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import validate from '../middleware/validation.middleware';
import * as unitTypeController from '../controllers/unitType.controller';
import * as unitTypeValidator from '../validators/unitType.validator';
import { USER_ROLES } from '../constants';

const router = Router();

router.get(
  '/',
  validate(unitTypeValidator.unitTypeQuerySchema, 'query'),
  unitTypeController.getAllUnitTypes,
);

router.get('/:id', unitTypeController.getUnitTypeById);

router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(unitTypeValidator.createUnitTypeSchema),
  unitTypeController.createUnitType,
);

router.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(unitTypeValidator.updateUnitTypeSchema),
  unitTypeController.updateUnitType,
);

router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  unitTypeController.deleteUnitType,
);

export default router;
