import Joi from 'joi';

export const createPurchaseSchema = Joi.object({
  supplierId: Joi.number().integer().positive().required(),
  supplierInvoiceNo: Joi.string().max(50).optional(),
  purchaseDate: Joi.date().optional(),
  totalAmount: Joi.number().min(0).optional(),
  status: Joi.string().valid('PENDING', 'RECEIVED').optional(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().positive().required(),
      buyPrice: Joi.number().min(0).required(),
      expiryDate: Joi.date().optional(),
    }),
  ).min(1).required(),
});

export const updatePurchaseSchema = Joi.object({
  supplierId: Joi.number().integer().positive().optional(),
  supplierInvoiceNo: Joi.string().max(50).optional(),
  totalAmount: Joi.number().min(0).optional(),
  status: Joi.string().valid('PENDING', 'RECEIVED').optional(),
}).min(1);

export const purchaseQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  supplierId: Joi.number().integer().positive().optional(),
  status: Joi.string().valid('PENDING', 'RECEIVED').optional(),
});
