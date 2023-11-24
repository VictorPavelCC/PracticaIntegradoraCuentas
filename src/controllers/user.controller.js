const sessionsDao = require("../dao/sessionsDao")

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

