const crypto = require('crypto');
const asyncHandler = require('../middlewares/asyncHandler');
const { uploadBuffer, deleteBlob } = require('../services/blobService');
const { isPdf, runPdfOcr } = require('../services/ocrService');

const uploadDocument = asyncHandler(async (req, res) => {
  const file = req.file;
  const docName = req.body.name || file.originalname;
  const blobName = `${req.user._id}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${file.originalname}`;
  const uploaded = await uploadBuffer({
    buffer: file.buffer,
    blobName,
    contentType: file.mimetype
  });

  const ocr = isPdf(file.mimetype, file.originalname)
    ? await runPdfOcr({
        documentUrl: uploaded.url,
        fileName: file.originalname,
        documentName: docName
      })
    : {
        attempted: false,
        status: 'not_applicable',
        message: 'OCR is only triggered for PDF files',
        extractedText: ''
      };

  res.status(201).json({
    success: true,
    document: {
      name: docName,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: uploaded.url,
      blobName: uploaded.blobName,
      ocr
    }
  });
});

const removeDocument = asyncHandler(async (req, res) => {
  await deleteBlob(req.params.blobName);
  res.json({ success: true, message: 'Blob deleted' });
});

module.exports = {
  uploadDocument,
  removeDocument
};
