const cloudinary = require('../config/cloudinary');
const { cloudinaryBreaker } = require('./circuitBreaker');
const logger = require('./logger');

const uploadPDFToCloudinary = (pdfStream, invoiceNo) => {
  return cloudinaryBreaker.fire(() => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder:        'invoices',
          public_id:     invoiceNo,
          format:        'pdf'
        },
        (error, result) => {
          if (error) {
            logger.error(`Cloudinary upload error: ${error.message}`);
            return reject(error);
          }
          logger.info(`✅ PDF uploaded to Cloudinary: ${result.secure_url}`);
          resolve(result.secure_url);
        }
      );
      pdfStream.pipe(uploadStream);
    });
  });
};

const deletePDFToCloudinary = async (invoiceNo) => {
  return cloudinaryBreaker.fire(async () => {
    try {
      await cloudinary.uploader.destroy(`invoices/${invoiceNo}`, {
        resource_type: 'raw'
      });
      logger.info(`✅ PDF deleted from Cloudinary: ${invoiceNo}`);
    } catch (error) {
      logger.error(`Cloudinary delete error: ${error.message}`);
      throw error;
    }
  });
};

const getSignedURL = (invoiceNo) => {
  return cloudinary.url(`invoices/${invoiceNo}`, {
    resource_type: 'raw',
    sign_url:      true,
    expires_at:    Math.floor(Date.now() / 1000) + 3600
  });
};

module.exports = {
  uploadPDFToCloudinary,
  deletePDFToCloudinary,
  getSignedURL
};