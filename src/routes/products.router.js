const { Router } = require("express");
const productsController = require("../controllers/products.controller");
const {isAdmin , isPremium, noAdmin} = require("../middleware/rol")
const router = Router();



router.get("/", productsController.getAllProducts);
router.get("/productsList", productsController.getProductList);


router.get("/manager",isAdmin,productsController.getManagerProducts);
router.get("/manager/createProduct",isPremium, productsController.getCreateProduct);

//añadir errores
router.post("/manager/createProduct",isPremium, productsController.postCreateProduct);
router.get("/manager/:pid", isPremium, productsController.getManagerProduct);
router.delete("/manager/:id", isPremium, productsController.deleteProduct);


router.get("/:id", productsController.getProductById);
router.get("/categories", productsController.getProductsByCategory);
router.post("/", productsController.postProduct)
router.put("/:id", isPremium, productsController.putProduct)


//manager

/* 
router.get("/manager/new-product", authToken, isAdmin, productsController.getCreateProduct);
router.post("/manager/new-product", authToken, isAdmin, checkProductValues, productsController.postCreateProduct);
router.get("/manager/:id", authToken, isAdmin, productsController.getProductManager);
router.delete("/manager/:id", authToken, isAdmin, productsController.deleteProduct);
 */




module.exports = router