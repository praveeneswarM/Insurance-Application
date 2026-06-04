const { MongoClient } = require('mongodb');
const pdfParse = require('pdf-parse');

const OCR_STATUSES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

let cachedClient;

const getClient = async () => {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.COSMOS_DB_URI);
    await cachedClient.connect();
  }

  return cachedClient;
};

const getCollections = async () => {
  const client = await getClient();
  const database = client.db(process.env.COSMOS_DB_NAME || 'insurance-management');

  return {
    ocrResults: database.collection(process.env.OCR_RESULTS_COLLECTION || 'ocrresults'),
    applications: database.collection(process.env.APPLICATIONS_COLLECTION || 'applications')
  };
};

const combineOcrText = (documents) =>
  documents
    .filter((document) => document.ocrText)
    .map((document) => `[${document.name}] ${document.ocrText}`)
    .join('\n\n');

const deriveApplicationStatus = (documents) => {
  const pdfDocuments = documents.filter((document) => document.mimeType === 'application/pdf');

  if (!pdfDocuments.length) {
    return {
      ocrStatus: OCR_STATUSES.COMPLETED,
      ocrText: '',
      ocrProcessedAt: null
    };
  }

  const statuses = pdfDocuments.map((document) => document.ocrStatus || OCR_STATUSES.PENDING);

  if (statuses.includes(OCR_STATUSES.PROCESSING)) {
    return {
      ocrStatus: OCR_STATUSES.PROCESSING,
      ocrText: '',
      ocrProcessedAt: null
    };
  }

  if (statuses.includes(OCR_STATUSES.PENDING)) {
    return {
      ocrStatus: OCR_STATUSES.PENDING,
      ocrText: '',
      ocrProcessedAt: null
    };
  }

  if (statuses.includes(OCR_STATUSES.FAILED)) {
    return {
      ocrStatus: OCR_STATUSES.FAILED,
      ocrText: combineOcrText(pdfDocuments),
      ocrProcessedAt: pdfDocuments.map((document) => document.ocrProcessedAt).filter(Boolean).sort().at(-1) || null
    };
  }

  return {
    ocrStatus: OCR_STATUSES.COMPLETED,
    ocrText: combineOcrText(pdfDocuments),
    ocrProcessedAt: pdfDocuments.map((document) => document.ocrProcessedAt).filter(Boolean).sort().at(-1) || null
  };
};

module.exports = async function (context, inputBlob) {
  const blobName = context.bindingData.name;
  const processedAt = new Date();
  const { ocrResults, applications } = await getCollections();

  await ocrResults.updateOne(
    { blobName },
    {
      $set: {
        blobName,
        fileName: blobName.split('/').at(-1) || blobName,
        ocrStatus: OCR_STATUSES.PROCESSING,
        ocrProcessedAt: null
      }
    },
    { upsert: true }
  );

  try {
    const parsed = await pdfParse(inputBlob);
    const ocrText = parsed.text || '';

    await ocrResults.updateOne(
      { blobName },
      {
        $set: {
          ocrStatus: OCR_STATUSES.COMPLETED,
          ocrText,
          ocrProcessedAt: processedAt
        }
      },
      { upsert: true }
    );

    const application = await applications.findOne({ 'documents.blobName': blobName });

    if (!application) {
      context.log(`OCR completed for ${blobName}, but no application record exists yet.`);
      return;
    }

    const documents = application.documents.map((document) =>
      document.blobName === blobName
        ? {
            ...document,
            ocrStatus: OCR_STATUSES.COMPLETED,
            ocrText,
            ocrProcessedAt: processedAt
          }
        : document
    );

    const aggregate = deriveApplicationStatus(documents);

    await applications.updateOne(
      { _id: application._id },
      {
        $set: {
          documents,
          ocrStatus: aggregate.ocrStatus,
          ocrText: aggregate.ocrText,
          ocrProcessedAt: aggregate.ocrProcessedAt
        }
      }
    );
  } catch (error) {
    await ocrResults.updateOne(
      { blobName },
      {
        $set: {
          ocrStatus: OCR_STATUSES.FAILED,
          ocrText: '',
          ocrProcessedAt: processedAt
        }
      },
      { upsert: true }
    );

    const application = await applications.findOne({ 'documents.blobName': blobName });

    if (application) {
      const documents = application.documents.map((document) =>
        document.blobName === blobName
          ? {
              ...document,
              ocrStatus: OCR_STATUSES.FAILED,
              ocrText: '',
              ocrProcessedAt: processedAt
            }
          : document
      );

      const aggregate = deriveApplicationStatus(documents);

      await applications.updateOne(
        { _id: application._id },
        {
          $set: {
            documents,
            ocrStatus: aggregate.ocrStatus,
            ocrText: aggregate.ocrText,
            ocrProcessedAt: aggregate.ocrProcessedAt
          }
        }
      );
    }

    context.log(`OCR failed for blob ${blobName}`, error);
    throw error;
  }
};
