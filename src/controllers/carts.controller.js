const { cartModel } = require("../dao/models/cart.model");
const { productModel } = require("../dao/models/product.model");
const CartDao = require("../dao/cartDao")
const productDao = require("../dao/productsDao");
const ticketDao = require("../dao/ticketDao")
const nodemailer = require("nodemailer")
const { CustomError } = require("../services/errors/CustomError")
const { CartErrorParams } = require("../services/errors/cartErrorNotExist")
const { sendEmail } = require("./sessions.controller")


exports.createCart = async (req, res) => {
    try {
      const newCart = await CartDao.createCart();    
      
      res.status(201).json(newCart);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
      }
};
  
  exports.getAllCarts = async (req, res) => {
        try {
          let carts = await CartDao.getAllCarts();      
          res.json({ status: "success", payload: carts });
        } catch (error) {
          res.status(500).json({ error: "Error al obtener los carritos" })
        }
  };
  
  exports.getCart = async (req, res) => {
    const id = req.params.cid;
    try {
      
      const cart = await CartDao.getCart(id);
      console.log(cart)

      if (!id || id.trim() === "") {
        CustomError.createError({
          name: "Error id carrito",
          cause: CartErrorParams(id),
          message: "Error obteniendo el carrito",
          errorCode: EError.INVALID_PARAMS,
        });
      }
      //antes
      //const resume = cart.products.map(async (p)
    const resume = await Promise.all(cart.products.map(async (p) => {
      const data = {};
      data.info = await productModel.findById(p.product);
      data.quantity = p.quantity;
      data.total = data.info.price * p.quantity;
      
      return data;
    }));
    //const products = await Promise.all(resume);
  
    let total = 0;
    
    for (const product of cart.products) {
      total += product.product.price * product.quantity;
    }

      res.render("carts", {
        status: "success",
        cartId: id,
        products: resume,
        total: total,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al obtener el carrito" });
    }
  };
  
  exports.addToCart = async (req, res) => {
  const cid = req.params.cid;
  const productId = req.body.productId;

  try {
     const result = await CartDao.addToCart( cid, productId)

    res.status(200).json({ ok: "Producto agregado correctamente" });
  } catch (error) {
    console.log(error);
  }
  };
  
  exports.updateCartProduct = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;
        const cart = await CartDao.updateCartProduct(cid, pid, quantity)
    
        res.json({ message: "La cantidad del producto fue actualizada"  });
      } catch (error) {
        res.status(500).json({ error: "Error al actualizar la cantidad de producto en el carrito" });
      }
  };
  
  exports.removeCartProduct = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const quantity = req.body.quantity;
        
        const cart = await CartDao.removeCartProduct(cid, pid, quantity);
        res.json({ message: "Producto eliminado del carrito con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el producto del carrito" });
    }
  };
  
  exports.deleteCart = async (req, res) => {
    try {
        const { cid } = req.params;

        const cart = await CartDao.deleteCart(cid)
    
        res.json({  message: "El Carrito ha sido vaciado" });
      } catch (error) {
        res.status(500).json({ error: "Error al eliminar vaciar del carrito" });
      }
  };

  exports.purchaseCart = async (req, res) => {
    try {
      const { cid } = req.params;
      const cart = await CartDao.getCart(cid)
  
      if (!cart) {
        return res.status(404).json({ status: 'error', message: 'Cart not found' });
      }
 
      const productsToPurchase = []; // Disponible
      const productsNotPurchased = []; // No disponible
      let totalPrice = 0;

      for (const cartItem of cart.products) {
        // Stock
        const product = await productModel.findById(cartItem.product);
        if (product.stock >= cartItem.quantity) {
          product.stock -= cartItem.quantity;
          await product.save();
          productsToPurchase.push(cartItem);
          
          totalPrice += product.price * cartItem.quantity;
        } else {

          productsNotPurchased.push(cartItem);
        }
      }
      const amount = totalPrice
    
      const ticketData = {
        cart: cart._id,
        purchase_datetime: new Date(),
        amount,
        purchaser: req.user.email,
      };
      
      const TicketSave = await ticketDao.createTicket(ticketData);

      cart.products = productsNotPurchased;
      await cart.save();
      const resume = cart.products.map(async (p) => {
        const data = {};
        data.info = await productModel.findById(p.product);
        data.quantity = p.quantity;
        data.total = data.info.price * p.quantity;
        
        return data;
      });
      const dataCompra = await Promise.all(resume);
    
      //Mail

      const mailOptions = {
        to: req.user.email,
        subject: 'Cuenta Eliminada',
        html: `<p>Hola <b>${req.user.first_name} ${req.user.last_name}</b>,</p>
        <img src="https://www.compudemano.com/wp-content/uploads/2019/01/gracias-por-tu-compra.jpg" style="width:250px"/>
      <p>Gracias por usar nuestros servicios</p>`,
      };

      await sendEmail(mailOptions)

      res.render("ticket", {
        status: "success",
        ticket: ticketData,
        notPurchasedProducts: productsNotPurchased,
        purchasedProducts: productsToPurchase,
        cartId: cid,
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
  
 