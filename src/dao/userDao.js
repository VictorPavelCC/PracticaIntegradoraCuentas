const { userModel } = require('../dao/models/user.model')


async function getAllUsers(){
    try{
        let users = await userModel.find();
        return  users
    }catch(error)
    {
        console.log("error getAllUsers: ", error)
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


module.exports = { 
    getAllUsers,
    updateData,
    updateConnection,
    deleteUser,
}