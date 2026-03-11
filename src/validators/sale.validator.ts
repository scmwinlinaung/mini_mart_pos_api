import Joi from 'joi';

export const createSaleSchema = Joi.object({
  invoiceNo: Joi.string().min(1).max(50).required(),
  customerId: Joi.number().integer().positive().optional().allow(null),
  productId: Joi.number().integer().positive().required(),
  unitTypeId: Joi.number().integer().positive().required(),
  barcode: Joi.string().min(1).max(50).required(),
  productName: Joi.string().min(1).max(50).required(),
  quantity: Joi.number().integer().min(1).required(),
  unitPrice: Joi.number().min(0).required(),
  totalPrice: Joi.number().min(0).required(),
  taxAmount: Joi.number().min(0).optional(),
  discountAmount: Joi.number().min(0).optional(),
  subTotal: Joi.number().min(0).optional(),
  grandTotal: Joi.number().min(0).required(),
  paymentMethod: Joi.string().valid('CASH', 'CARD', 'QR', 'CREDIT').required(),
  paymentStatus: Joi.string().valid('PAID', 'PENDING', 'REFUNDED').optional(),
});

export const saleQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  invoiceNo: Joi.string().optional(),
  customerId: Joi.number().integer().positive().optional(),
  productId: Joi.number().integer().positive().optional(),
  paymentStatus: Joi.string().valid('PAID', 'PENDING', 'REFUNDED').optional(),
});

export const refundSchema = Joi.object({
  refundAmount: Joi.number().min(0).required(),
  reason: Joi.string().optional().allow(''),
});
