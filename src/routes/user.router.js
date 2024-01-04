const { Router } = require("express");
const { isAdmin } = require("../middleware/rol");
const userController = require("../controllers/user.controller");
const { upload } = require("../../utils")

const router = Router();

router.get("/premiums/:id", isAdmin,userController.ChangeRol);
router.get("/premium/:uid", userController.UserToPremium);
router.get("/",isAdmin,userController.renderUsers);
router.get('/:uid/documents/', userController.renderUploadDocument);

router.post("/:uid/documents",upload.array('documents'),userController.uploadDocument)

router.delete("/", isAdmin, userController.deleteUsers)

router.get("/changeConnection/:id", userController.changeLastConnection)

module.exports = router;