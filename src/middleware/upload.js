const multer = require('multer');
const path = require('path');

const filefilter = (req, file, cb) => {
  const typeFile = file.mimetype.split("/")[1]
  if(typeFile == "jpg" || typeFile == "jpeg" || typeFile == "png"){
    cb(null, true)
  }else {
    cb(null, false, new Error('wrong type'))
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./src/public/images")
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
    // cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  },
});
  
module.exports = multer({
  storage: storage,
  fileFilter: filefilter,
  limits: {
    fileSize: 1*1024*1024
}}).single('product_img')