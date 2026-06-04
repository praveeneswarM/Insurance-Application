const mongoose = require('mongoose');
const connectDb = require('../src/config/db');
const Application = require('../src/models/Application');
const { deriveApplicationOcrState, getInitialDocumentOcrState } = require('../src/services/ocrService');

const run = async () => {
  await connectDb();

  const applications = await Application.find();

  for (const application of applications) {
    application.documents = application.documents.map((document) => {
      const initialState = getInitialDocumentOcrState({
        mimeType: document.mimeType,
        fileName: document.fileName
      });

      return {
        ...document.toObject(),
        ocrStatus: document.ocrStatus === undefined ? initialState.ocrStatus : document.ocrStatus,
        ocrText: document.ocrText === undefined ? initialState.ocrText : document.ocrText,
        ocrProcessedAt: document.ocrProcessedAt === undefined ? initialState.ocrProcessedAt : document.ocrProcessedAt
      };
    });

    const aggregate = deriveApplicationOcrState(application.documents);
    application.ocrStatus = application.ocrStatus || aggregate.ocrStatus;
    application.ocrText = application.ocrText || aggregate.ocrText;
    application.ocrProcessedAt = application.ocrProcessedAt || aggregate.ocrProcessedAt;

    await application.save();
  }

  console.log(`Backfilled OCR state for ${applications.length} applications`);
  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.log('Failed to backfill OCR state', error);
  await mongoose.connection.close();
  process.exit(1);
});
