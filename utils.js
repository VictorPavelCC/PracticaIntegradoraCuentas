const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const multer = require('multer');


dotenv.config();

SECRET_KEY= process.env.SECRET_KEY

//Hash
const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
const isValidatePassword = (user, password) => bcrypt.compareSync(password, user.password);

//token

const generateRecoveryToken= (email) => {
    const secretKey =  SECRET_KEY; // Cambia esto con una clave segura
    const expirationTime = '1h'; // El token expira en 1 hora
  
    return jwt.sign({ email }, secretKey, { expiresIn: expirationTime });
}
const verifyRecoveryToken= (token) => {
    const secretKey = SECRET_KEY; // Cambia esto con la misma clave utilizada para generar
  
    try {
      const decoded = jwt.verify(token, secretKey);
      return decoded.email;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return null;
    }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    if (req.body.fileType === 'profileImage') {
      cb(null, 'public/profile');
  } else if (req.body.fileType === 'productImage') {
      cb(null, 'public/products');
  } else if (req.body.fileType === 'document') {
      cb(null, 'public/documents');
  } else {
      cb(new Error("Invalid fileType"));
  }
  
  },
  filename: (req, file, cb) =>{
    cb(null, Date.now() + '-' + file.originalname)
  }

});

const upload = multer({ storage })



module.exports = {
    createHash,
    generateRecoveryToken,
    isValidatePassword,
    verifyRecoveryToken,
    upload,
}