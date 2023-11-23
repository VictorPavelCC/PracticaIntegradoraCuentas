//Verificacion de Admin
function isAdmin(req, res, next) {
    if (req.user && req.user.rol === 'Admin') {
      next();
    } else {
      return res.status(403).json({ error: 'Acceso no autorizado, No es Admin' });
    }
}

function isPremium (req, res,next) {
  if (req.user && req.user.rol === 'premium' || req.user && req.user.rol === 'Admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Acceso no autorizado.' });
  }
}

function noAdmin(req, res, next){
  if (req.user && req.user.rol === 'admin') return res.status(403).json({ error: 'This site is only for users' });
  next();
}



module.exports = { isAdmin, isPremium, noAdmin }