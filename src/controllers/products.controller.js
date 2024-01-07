const { productModel } = require("../dao/models/product.model");
const { cartModel } = require("../dao/models/cart.model");
const productsDao = require("../dao/productsDao");
const { paginate } = require("mongoose-paginate-v2");
const sessionDao = require("../dao/sessionsDao")
const sessionController = require("./sessions.controller")
const userDao = require("../dao/userDao")


exports.getAllProducts = async (req, res) => {
  try {
    let { limit, page, sort, category } = req.query;

    limit = parseInt(limit, 10) || 10;
    page = parseInt(page, 10) || 1;
    sort = sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {};

    const query = category ? { category } : {};

    const options = { limit, page, sort };

    const products = await productsDao.getAllProducts(query, options);

    const totalPages = products.totalPages;
    const hasPrevPage = products.hasPrevPage;
    const hasNextPage = products.hasNextPage;
    const prevLink = hasPrevPage ? `/api/products?limit=${limit}&page=${page - 1}&sort=${sort}&category=${category}`: null;
    const nextLink = hasNextPage ? `/api/products?limit=${limit}&page=${page + 1}&sort=${sort}&category=${category}`: null;

    res.send({
      status: "success",
      payload: products.docs,
      totalPages,
      prevPage: page - 1,
      nextPage: page + 1,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Error al obtener los productos" });
  }
};
  
  exports.getProductList = async (req, res) => {
  let { limit, page, sort, category } = req.query;
  try {
    limit = parseInt(limit, 10) || 10;
    page = parseInt(page, 10) || 1;
    sort = sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {};

    const query = category && category !== "Todas" ? { category } : {};

    const options = { limit, page, sort };

    const sessionUser = req.session.user;


    let result = await productsDao.getProductList(query, options, sessionUser);

    result.selectedCategory = category || "Todas";
    res.render("productsList", result);
  } catch (error) {
    console.log(error)
  }
};


  exports.getProductById = async (req, res) => {
  let id = req.params.id;
  try {
    const product = await productsDao.getProductById(id);
    res.render("product", {
      payload: product,
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Error al obtener el producto" });
  }
};

  
exports.getProductsByCategory = async (req, res) => {
  try {
    const result = await productsDao.getProductsByCategory();
    res.send(result);
  } catch (error) {
    res.status(500).json({ status: "error", error: "Error al obtener las categorías" });
  }
};

  
    
exports.postProduct = async (req, res) => {
  let { name, category, price, stock, image } = req.body;

  if (!name || !category || !price || !stock || !image) {
    res.send({ status: "error", error: "Missing parameters" });
  } else {
    let result = await productsDao.postProduct(name, category, price, stock, image);
    res.send(result);
  }
};
  

exports.putProduct = async (req, res) => {
  let id = req.params.id;
  let uid = req.session.user._id
  let { name, category, price, stock, image, owner } = req.body;

  try{
    let product = await productsDao.getProductById(id)
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    if(! product.owner == uid) return res.status(403).json({ error: 'Acceso no autorizado. No eres el creador del producto' });
    
    product.name = name;
    product.category = category;
    product.stock = stock;
    product.price = price;
    product.image = image;

    let save = await productsDao.putProduct(id,product);
    res.status(200).json({ message: 'El Producto ha sido actualizado' });
  }catch(error){
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }


};
exports.deleteProduct = async (req, res) => {
  let id = req.params.id;
  try{
    let product = await productsDao.getProductById(id)
    if(!product) {res.send({ status: "error", error: "El Producto no existe" });}
    if(! product.owner == req.session.user._id) return res.status(403).json({ error: 'No tienes permisos sobre este producto.' })
    
    let user = await  sessionDao.findUserById(product.owner)



    const mailOptions = {
      to: user.email,
      subject: 'Producto Eliminado',
      html: `<p>Hola <b>${user.first_name} ${user.last_name}</b>,</p>
      Tu producto fue eliminado por el administrador`,
    };


    let send = await sessionController.sendEmail(mailOptions);


    let eliminar = productsDao.deleteProduct(id);

    res.status(200).json({ message: 'El Producto ha sido eliminado' });
  } catch(error){
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

};

exports.getManagerProducts = async (req, res) =>{ 

  let { limit, page, sort, category } = req.query;
  

  try{
    limit = parseInt(limit, 10) || 10;
    page = parseInt(page, 10) || 1;
    sort = sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {};
    
    const query = category ? { category } : {};
    const options = { limit, page, sort };

    //separar a Dao Products  HECHO
    let products = await productsDao.getPaginate(query, options);
    const sessionUser = req.session.user
    let uid = req.session.user._id

    const pageNumbers = [];
    for (let i = 1; i <= products.result.totalPages; i++) {
      pageNumbers.push({ number: i, current: i === products.result.page });
    }
    let categories;

    //separar a Dao Products  HECHO
    const result = await productsDao.getProductsByCategory()
    categories = result.categories;
    categories.push("Todas");

 

    res.render("managerProducts", {
        status: "success",
        payload: products.result.docs,
        totalPages: products.result.totalPages,
        prevPage: products.result.prevPage,
        nextPage: products.result.nextPage,
        page: products.result.page,
        hasPrevPage: products.result.hasPrevPage,
        hasNextPage: products.result.hasNextPage,
        pageNumbers: pageNumbers,
        categories: categories,
        user: sessionUser,
        userID: uid
        
      });

  } catch (error){
    console.log("Error en manager:", error);

  }
}

exports.getCreateProduct = async (req, res) => {
  try {
    const sessionUser = req.session.user;
    const userImages = await userDao.getFiles(req.session.user._id)


    res.render("createProduct",{
      status: "success",
      user: sessionUser,
      productImages: userImages,
      selectedProductImage: null
    });
  } catch (error) {
    res.status({status: error,
    });
  }
};


exports.postCreateProduct = async (req, res) =>{
  const { name, category, stock, price, image } = req.body;

  const user= req.session.user;
  
  
  const owner =  req.session.user._id;
  
  try {
    const newProduct = {
      name,
      category,
      stock,
      price,
      image,
      owner,
    }
    
    //crear producto
    let result = await productsDao.postProduct(newProduct);
    res.status(200).json({ message: 'Producto creado correctamente', userRole: req.session.user.rol , product: newProduct});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }


}


exports.getManagerProduct = async (req, res) =>{

 let pid = req.params.pid;
    try{
      const product = await productsDao.getProductById(pid)
      const UserId = req.session.user._id
      const userRole = req.session.user.rol

      //Si no es admin es Premium
      if(req.session.user.rol != "Admin"){ 
        //Si no coincide con su Id
        if(product.owner != UserId) return res.status(403).json({ error: 'Acceso no autorizado.' });
      }

      res.render("managerProduct", {
      payload: product,
      userRole: userRole,
    });
      

    }catch(error){
      res.status({
        status: error,
      });
    }



}
