module.exports = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.COSMOS_DB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/insurance-management',
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  nodeEnv: 'production',
  clientUrl: process.env.CLIENT_URL || '',
  azureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
  azureContainerName: process.env.AZURE_CONTAINER_NAME || 'insurance-documents'
};
