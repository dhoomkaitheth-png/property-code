const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

createDir(path.join(__dirname, '../../uploads/properties'));
createDir(path.join(__dirname, '../../uploads/imports'));

// Storage configuration for property images
const propertyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/properties'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage configuration for CSV/Excel imports
const importStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/imports'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedImportTypes = /csv|xlsx|xls/;

  const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedImageTypes.test(file.mimetype);

  const importExt = allowedImportTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname || mimetype) {
    cb(null, true);
  } else if (importExt) {
    cb(null, true);
  } else {
    cb(new Error(`File type not supported. Allowed: JPEG, PNG, GIF, WebP, CSV, XLSX`));
  }
};

const uploadPropertyImage = multer({
  storage: propertyStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

const uploadImport = multer({
  storage: importStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});

module.exports = { uploadPropertyImage, uploadImport };