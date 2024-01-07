const { userModel } = require('../dao/models/user.model')
const sessionsController = require("../controllers/sessions.controller")


async function getAllUsers(){
    try{
        let users = await userModel.find();
        return  users
    }catch(error)
    {
        console.log("error getAllUsers: ", error)
    }
}
async function findUserById(id) {
    try {
        const user = await userModel.findById(id);
        return user
    } catch (error) {
        throw new Error('Error al buscar al usuario por ID');
    }
}

  async function updateData(id, data){
    try {
        let result = await userModel.updateOne({_id: id}, {...data})
        return result 
    } catch (error) {
        console.log( "error de Update Data: ",error)
        
    }
}
async function updateConnection(id, date){
    try {
        let result = await userModel.updateOne({_id: id}, {last_connection: date})
        return result 
    } catch (error) {
        console.log( "error de Update Connection: ",error)
        
    }
}

async function deleteUser(uid){
    try {
        let result = await userModel.deleteOne({_id: uid})
        return result
    } catch (error) {
        console.log( "error de delete User: ",error)
    }
}

async function deleteInactiveUsers(){
    try {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 2);
    
        const inactiveUsers = await userModel.find({ last_connection: { $lt: fechaLimite } });
    
        for (const user of inactiveUsers) {
          //console.log("El usuario a eliminar es:", user);
    
          const mailOptions = {
            to: user.email,
            subject: 'Cuenta Eliminada',
            html: `<p>Hola <b>${user.first_name} ${user.last_name}</b>,</p>
              Se ha eliminado tu cuenta por inactividad.`,
          };
    
          const send = await sessionsController.sendEmail(mailOptions);
          console.log("Email Enviado", send);
    
          // Elimina al usuario si no es admin
          if (user.rol === "user" || user.rol === "premium") {
            await userModel.deleteOne({ _id: user._id });
          }
        }
    
        return { success: true, message: 'Usuarios eliminados correctamente' };
      } catch (error) {
        console.error('Error al eliminar usuarios inactivos en el DAO', error);
        throw error; 
      }
    
}

async function getFiles(userId) {
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Obtener nombres de documentos e imágenes existentes
        const existingFiles = user.documents.map(document => document.name);
        return existingFiles;
    } catch (error) {
        console.error('Error al obtener archivos existentes:', error);
        throw error;
    }
}



module.exports = { 
    getAllUsers,
    findUserById,
    updateData,
    updateConnection,
    deleteUser,
    deleteInactiveUsers,
    getFiles,
}