const Joi = require('joi');

const createApplicationSchema = Joi.object({
  planId: Joi.string().required(),
  age: Joi.number().min(18).max(120).required(),
  documents: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        fileName: Joi.string().required(),
        mimeType: Joi.string().required(),
        size: Joi.number().required(),
        url: Joi.string().uri().required(),
        blobName: Joi.string().required(),
        ocrStatus: Joi.string().valid('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED').allow(null).optional(),
        ocrText: Joi.string().allow('').optional(),
        ocrProcessedAt: Joi.date().allow(null).optional()
      })
    )
    .min(1)
    .required()
});

const reviewSchema = Joi.object({
  adminComments: Joi.string().allow('').max(500).default('')
});

module.exports = {
  createApplicationSchema,
  reviewSchema
};
