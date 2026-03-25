import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import validate from '../middleware/validation.middleware';
import * as userController from '../controllers/user.controller';
import * as userValidator from '../validators/user.validator';
import { USER_ROLES } from '../constants';

const router = Router();

router.use(authenticate);

// Routes that require admin/manager role
router.get(
  '/',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(userValidator.userQuerySchema, 'query'),
  userController.getAllUsers,
);

router.get(
  '/roles',
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  userController.getRoles,
);

router.get('/:id', authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), userController.getUserById);

router.post(
  '/',
  authorize(USER_ROLES.ADMIN),
  validate(userValidator.createUserSchema),
  userController.createUser,
);

router.put(
  '/:id',
  authorize(USER_ROLES.ADMIN),
  validate(userValidator.updateUserSchema),
  userController.updateUser,
);

router.delete(
  '/:id',
  authorize(USER_ROLES.ADMIN),
  userController.deleteUser,
);

// Users can change their own password
router.post(
  '/change-password',
  validate(userValidator.changePasswordSelfSchema),
  userController.changePasswordSelf,
);

export default router;
