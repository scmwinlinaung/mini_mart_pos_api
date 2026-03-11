import Joi from 'joi';

export const createCustomerSchema = Joi.object({
  phoneNumber: Joi.string().max(15).optional().allow(''),
  fullName: Joi.string().max(50).optional().allow(''),
  address: Joi.string().optional().allow(''),
  loyaltyPoints: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

export const updateCustomerSchema = Joi.object({
  phoneNumber: Joi.string().max(15).optional().allow(''),
  fullName: Joi.string().max(50).optional().allow(''),
  address: Joi.string().optional().allow(''),
  loyaltyPoints: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

export const customerQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});
