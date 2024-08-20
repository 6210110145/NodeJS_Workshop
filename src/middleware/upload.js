const multer = require('multer');
const path = require('path');
const fs = require('fs')

const filefilter = (req, file, cb) => {
  const typeFile = file.mimetype.split("/")[1]
  if(typeFile == "jpg" || typeFile == "jpeg" || typeFile == "png"){
    cb(null, true)
  }else {
    cb(null, false, new Error('not image'))
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', "public/images");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname + '-' + Date.now() + path.extname(file.originalname))
  },
});
  
module.exports = multer({
  storage: storage,
  fileFilter: filefilter,
  limits: {
    fileSize: 5*1024*1024
}}).array('product_img', 5);