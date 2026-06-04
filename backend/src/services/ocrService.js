const OCR_STATUSES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

const isPdf = (mimeType, fileName = '') =>
  mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

const getInitialDocumentOcrState = ({ mimeType, fileName }) => {
  if (!isPdf(mimeType, fileName)) {
    return {
      ocrStatus: null,
      ocrText: '',
      ocrProcessedAt: null
    };
  }

  return {
    ocrStatus: OCR_STATUSES.PENDING,
    ocrText: '',
    ocrProcessedAt: null
  };
};

const latestProcessedAt = (documents) =>
  documents
    .map((document) => document.ocrProcessedAt)
    .filter(Boolean)
    .sort((left, right) => new Date(left) - new Date(right))
    .at(-1) || null;

const deriveApplicationOcrState = (documents = []) => {
  const pdfDocuments = documents.filter((document) => isPdf(document.mimeType, document.fileName));

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
      ocrText: pdfDocuments
        .filter((document) => document.ocrText)
        .map((document) => `[${document.name}] ${document.ocrText}`)
        .join('\n\n'),
      ocrProcessedAt: latestProcessedAt(pdfDocuments)
    };
  }

  return {
    ocrStatus: OCR_STATUSES.COMPLETED,
    ocrText: pdfDocuments
      .filter((document) => document.ocrText)
      .map((document) => `[${document.name}] ${document.ocrText}`)
      .join('\n\n'),
    ocrProcessedAt: latestProcessedAt(pdfDocuments)
  };
};

module.exports = {
  OCR_STATUSES,
  isPdf,
  getInitialDocumentOcrState,
  deriveApplicationOcrState
};
