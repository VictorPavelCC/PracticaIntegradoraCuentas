const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv =require('dotenv')

dotenv.config();

SECRET_KEY= process.env.SECRET_KEY

//Hash
const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
const isValidatePassword = (user, password) => bcrypt.compareSync(password, user.password);

//token

const generateRecoveryToken= (email) => {
    const secretKey = 'tu-secreto'; // Cambia esto con una clave segura
    const expirationTime = '1h'; // El token expira en 1 hora
  
    return jwt.sign({ email }, secretKey, { expiresIn: expirationTime });
  }
const verifyRecoveryToken= (token) => {
    const secretKey = 'tu-secreto'; // Cambia esto con la misma clave utilizada para generar
  
    try {
      const decoded = jwt.verify(token, secretKey);
      return decoded.email;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return null;
    }
  }



module.exports = {
    createHash,
    isValidatePassword,
    generateRecoveryToken,
    verifyRecoveryToken
}