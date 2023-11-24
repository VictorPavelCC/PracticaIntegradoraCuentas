const { Router } = require("express");
const { isAdmin } = require("../middleware/rol");
const userController = require("../controllers/user.controller");

const router = Router();

router.get("/premium/:id", isAdmin,userController.ChangeRol);



module.exports = router;