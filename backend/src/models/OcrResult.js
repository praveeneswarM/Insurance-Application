const mongoose = require('mongoose');
const { OCR_STATUSES } = require('../services/ocrService');

const ocrResultSchema = new mongoose.Schema(
  {
    blobName: { type: String, required: true, unique: true, index: true },
    fileName: { type: String, default: '' },
    documentName: { type: String, default: '' },
    ocrStatus: { type: String, enum: Object.values(OCR_STATUSES), required: true },
    ocrText: { type: String, default: '' },
    ocrProcessedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('OcrResult', ocrResultSchema);
