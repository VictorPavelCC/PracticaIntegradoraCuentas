const sessionsDao = require("../dao/sessionsDao")
const userModel = require("../dao/models/user.model")
const usersDao = require("../dao/userDao")


exports.renderUsers = async (req, res) => {
  try {

      const users = await usersDao.getAllUsers();
      const usersData = users.map(user => user.toObject())
      res.render("users", {users: usersData})
  } catch (error) {
    console.log(error)
      res.status(500).send("Error de render")
  }
};

exports.renderUploadDocument = async (req, res) => {
  const uid = req.params.uid;
  res.render('uploadDocument', { uid });
}
exports.ChangeRol = async(req, res) =>{
    let id = req.params.id;
    try {
        let user = await sessionsDao.findUserById(id);
        const beforeRol = user.rol
    
        if (user.rol != "Admin"){
            if(user.rol == "user"){ user.rol = "premium"}
            
            else if( user.rol == "premium"){ user.rol = "user"
            }
            await sessionsDao.updateUser(user);


            return res.status(200).json({ message: `El rol del usuario fue actualizado de ${beforeRol} a ${user.rol} ` });
        }
        return res.status(200).json({ message: 'No eres admin' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

exports.getUserList = async(req,res) =>{

  try{
    let users = await usersDao.getAllUsers();
    res.render('users',users )

  }catch(error){
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error' });
  }

}


exports.uploadDocument = async(req,res) => {
  let uid = req.params.uid;
  try {
 

  if (!req.files || req.files.length === 0) return res.status(400).send({ status: 'error', error: 'file not uploaded' })
  

  const user = await sessionsDao.findUserById(uid)
  if (!user) return res.status(404).send({ status: 'error', error: 'user no found' })

  const newDocuments = req.files.map((file) => {
    return {
      name: file.originalname,
      reference: file.path,
    };
  });

  user.documents.push(...newDocuments);

  const result = await usersDao.updateData(uid, { documents: user.documents } )
  if (!result) return res.status(400).send({ status: 'error', error: 'file not uploaded en data' })

  res.send({ message: 'Archivo Subido Correctamente' })
  } catch (error) {
    console.error(error);
        return res.status(500).json({
            error: "Error en uploadDocument"
        });
  }

}

exports.UserToPremium = async (req, res) => {
  const uid = req.params.uid;

  try {
    
    const user = await sessionsDao.findUserById(uid)
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    if (user.rol == "premium"){
      return res.status(404).json({ error: 'Usuario Ya es Premium' });
    }


    const requiredDocuments = ['identificacion', 'comprobante de domicilio', 'comprobante de estado de cuenta'];
    const userDocuments = user.documents.map(document => getFileNameWithoutExtension(document.name.toLowerCase()));

    const documentsMissing = requiredDocuments.filter(document => !userDocuments.includes(document.toLowerCase()));
  
    if (documentsMissing.length > 0) {
      // Faltan Documentos por Procesar
      return res.status(400).json({ error: 'El usuario no ha terminado de procesar su documentación' });
    }

    user.rol = 'premium';
    await user.save();

    return res.json({ message: 'Usuario actualizado a premium correctamente' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error en la actualización a premium' });
  }
};

function getFileNameWithoutExtension(fileName) {
  return fileName.replace(/\.[^/.]+$/, "");
}