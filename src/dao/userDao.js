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

module.exports = { getAllUsers }