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

