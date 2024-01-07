const sessionsDao = require("../dao/sessionsDao")
const { userModel } = require("../dao/models/user.model")
const sessionsController = require("../controllers/sessions.controller")
const usersDao = require("../dao/userDao")


exports.renderUsers = async (req, res) => {
  try {

      const users = await usersDao.getAllUsers();
      const usersData = users.map((user) => {
        return {
          ...user.toObject(),
          last_connection_formatted: formatDate(user.last_connection), // Formatear la fecha si es necesario
        };
      })
      res.render("users", { users: usersData });
  } catch (error) {
    console.log(error)
      res.status(500).send("Error de render")
  }
};
function formatDate(date) {
  if (date) {
    return date.toLocaleString(); // Puedes usar bibliotecas como moment.js para un formato más avanzado
  } else {
    return 'N/A'; // O cualquier valor predeterminado que desees mostrar si la fecha no está definida
  }
}
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

//Funcion que quita la extension del archivo
function getFileNameWithoutExtension(fileName) {
  return fileName.replace(/\.[^/.]+$/, "");
}


exports.deleteUsers = async (req, res) => {

  try {
    const result = await usersDao.deleteInactiveUsers()

      return res.json({ message: result.message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al Eliminar Usuario en Controller' });
  
  }

}

exports.deleteUser = async (req, res) => {
  let userId = req.params.uid
  //eliminar Usuario
  try {   
    let user = await sessionsDao.findUserById(userId)
    
    const mailOptions = {
      to: user.email,
      subject: 'Cuenta Eliminada',
      html: `<p>Hola <b>${user.first_name} ${user.last_name}</b>,</p>
      Se ha eliminado tu cuenta.`,
    };
    
    // Elimina al usuario
    if(user.rol == "user" || user.rol == "premium"){
    let send = await sessionsController.sendEmail(mailOptions);
    console.log("email Enviado", send)
    const result = await usersDao.deleteUser(userId)
    res.json({ message: 'Usuario eliminado correctamente' });
  } else {
    res.json({ message: 'Este Usuario no se puede Eliminar' });
  }

    

    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al Eliminar Usuario en Controller' });
  
  }

}

exports.getDocumentList = async (req, res) => {
  try {
      const userId = req.session.user._id; // Ajusta la obtención del ID según tu estructura
      const user = await usersDao.findUserById(userId)

      if (!user) {
        return res.status(404).send('Usuario no encontrado');
    }

    const documents = user.documents.map(document => {
        const fileNameMatch = document.reference.match(/\\([^\\]+)$/);
        const fileName = fileNameMatch ? fileNameMatch[1] : null;
        const fileType = document.reference.includes('public\\documents') ? 'Document' :
                        document.reference.includes('public\\products') ? 'Product' :
                        document.reference.includes('public\\profile') ? 'Profile' : 'Unknown';
        return { fileName, fileType };
    }).filter(file => file.fileName !== null);

    res.render('myDocuments', { documents });
} catch (error) {
    console.error('Error al obtener la lista de documentos:', error);
    res.status(500).send('Error interno del servidor');
}
};


exports.changeLastConnection = async (req, res) => {
    let userId = req.params.id
  try {
    //cambia last_connection a 3 dias antes de la fecha actual
    let FechaActual = new Date();

    let NuevaFecha = new Date(FechaActual);
    NuevaFecha.setDate(FechaActual.getDate() - 3);
    //
    //Separar al Dao de User
    //userModel.updateOne({_id: userId}, {last_connection: NuevaFecha})
    let result =  await usersDao.updateData({_id:userId}, {last_connection: NuevaFecha})

    if (result) {
      // La actualización fue exitosa
      return res.json({ message: 'Last connection actualizada correctamente' });
    } else {
      // No se pudo actualizar, el usuario no existe
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }


  } catch (error) {
     console.error(error);
    return res.status(500).json({ error: 'Error al actualizar last_connection' });
  }

}