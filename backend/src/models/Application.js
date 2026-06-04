const mongoose = require('mongoose');
const { applicationStatuses } = require('../utils/constants');
const { OCR_STATUSES } = require('../services/ocrService');

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    blobName: { type: String, required: true },
    ocrStatus: { type: String, enum: Object.values(OCR_STATUSES), default: null },
    ocrText: { type: String, default: '' },
    ocrProcessedAt: { type: Date, default: null }
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'InsurancePlan', required: true },
    age: { type: Number, required: true },
    premium: { type: Number, required: true },
    documents: [documentSchema],
    ocrStatus: { type: String, enum: Object.values(OCR_STATUSES), default: OCR_STATUSES.PENDING },
    ocrText: { type: String, default: '' },
    ocrProcessedAt: { type: Date, default: null },
    status: { type: String, enum: applicationStatuses, default: 'Pending' },
    adminComments: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
