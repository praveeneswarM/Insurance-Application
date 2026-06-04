const mongoose = require('mongoose');
const { applicationStatuses } = require('../utils/constants');

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    blobName: { type: String, required: true },
    ocr: {
      attempted: { type: Boolean, default: false },
      status: { type: String, default: 'not_applicable' },
      message: { type: String, default: '' },
      extractedText: { type: String, default: '' }
    }
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
    status: { type: String, enum: applicationStatuses, default: 'Pending' },
    adminComments: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
