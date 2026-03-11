import Joi from 'joi';

export const createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(1).max(50).required(),
  roleId: Joi.number().integer().positive().required(),
  isActive: Joi.boolean().optional(),
});

export const updateUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).optional(),
  password: Joi.string().min(6).optional(),
  fullName: Joi.string().min(1).max(50).optional(),
  roleId: Joi.number().integer().positive().optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

export const changePasswordSelfSchema = Joi.object({
  oldPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
});

export const userQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  roleId: Joi.number().integer().positive().optional(),
});
