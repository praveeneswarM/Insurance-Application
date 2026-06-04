const env = require('../config/env');

const isPdf = (mimeType, fileName = '') =>
  mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

const buildHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (env.azureOcrFunctionKey) {
    headers['x-functions-key'] = env.azureOcrFunctionKey;
  }

  return headers;
};

const extractOcrTextFromResponse = (payload) => {
  if (!payload) return '';
  if (typeof payload.text === 'string') return payload.text;
  if (typeof payload.extractedText === 'string') return payload.extractedText;
  if (Array.isArray(payload.lines)) return payload.lines.join('\n');
  return '';
};

const runPdfOcr = async ({ documentUrl, fileName, documentName }) => {
  if (!env.azureOcrFunctionUrl) {
    return {
      attempted: false,
      status: 'skipped',
      message: 'OCR function is not configured'
    };
  }

  if (!documentUrl || documentUrl.includes('local-storage.invalid')) {
    return {
      attempted: false,
      status: 'skipped',
      message: 'OCR requires a reachable blob URL'
    };
  }

  const response = await fetch(env.azureOcrFunctionUrl, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({
      documentUrl,
      fileName,
      documentName
    })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      attempted: true,
      status: 'failed',
      message: payload.message || 'OCR function call failed'
    };
  }

  return {
    attempted: true,
    status: payload.success === false ? 'failed' : 'completed',
    message: payload.message || '',
    extractedText: extractOcrTextFromResponse(payload)
  };
};

module.exports = {
  isPdf,
  runPdfOcr
};
