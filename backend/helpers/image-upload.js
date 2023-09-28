const multer = require('multer');
const path = require('path');

// destino para guardar imagens
const imageStore = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "";
    if (req.baseUrl.includes("users")) {
      folder = "users";
    } else if ( req.baseUrl.includes("pets")) {
      folder = "pets";
    }    

    cb(null, `public/images/${folder}`);
  },
  filename: (req, file, cb) => {
    cb (
      null, 
      Date.now() + 
      String(Math.floor(Math.random() * 100)) +  
      path.extname(file.originalname),
    ); 
  },
});

const imageUpload = multer({
  storage: imageStore,
  fileFilter: (req, file, cb) => {
    // regex
    if(!file.originalname.match(/\.(png|jpg)$/)) {
      return cb(new Error("Por favor, envie apenas imagens .jpg ou .png"));
    }
    cb(undefined, true);
  },
});

module.exports = { imageUpload };