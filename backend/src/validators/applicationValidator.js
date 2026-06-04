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
        ocr: Joi.object({
          attempted: Joi.boolean().default(false),
          status: Joi.string().default('not_applicable'),
          message: Joi.string().allow('').default(''),
          extractedText: Joi.string().allow('').default('')
        }).optional()
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
