const { cartModel } = require("./models/cart.model");
const { productModel } = require("./models/product.model")


async function createCart() {
  try {
    const newCart = new cartModel({ products: [] });
    await newCart.save();
    return newCart 
  } catch (error) {
    console.error(error);
    throw new Error('Error al crear el carrito');
  }
}

async function getAllCarts() {
  try {
    return cartModel.find().populate("products.product");
  } catch (error) {
    throw new Error('Error al obtener los carritos');
  }
}

async function getCart(id) {
  try {
    return cartModel.findById(id).populate("products.product");
  } catch (error) {
    throw new Error('Error al obtener el carrito Dao');
  }
}

async function addToCart(cid, productId) {
  try {
    const product = await productModel.findById(productId);

    if (!product) res.status(404).json({ error: "No se encontro el producto" });

    /* if (!product.stock > 0)
      res.status(404).json({ error: "No hay stock disponible del producto" });
 */
    const cart = await cartModel.findById(cid);
    console.log(cart)

    if (!cart) res.status(404).json({ error: "El carrito no existe" });

    const cartProduct = cart.products.find(
      (product) => product.product.toString() === productId
    );

    if (cartProduct) {
      cartProduct.quantity += 1;
      //product.stock -= 1;
    } else {
      cart.products.push({ product: product._id });
    }

    
    await productModel.updateOne({ _id: productId }, product);
    await cartModel.updateOne({ _id: cid }, cart);
    return { message: 'producto Añadido al Carrito' }
  } catch (error) {
    console.error(error);
    throw new Error('Error al agregar un producto al carrito');
  }
}

async function updateCartProduct(cid, pid, quantity) {
  try {
    const cart = await cartModel.findById(cid);
  
    if (!quantity || quantity < 0) {
      return res.status(400).json({ error: "Cantidad inválida" });
    }

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const products = cart.products || [];
    const productUpdate = products.find((product) => product.product == pid);

    if (!productUpdate) {
      return res.status(404).json({ error: "Producto no encontrado en el carrito" });
    }

    productUpdate.quantity = quantity;
    await cart.save();

    return { message: 'La cantidad del producto fue actualizada' };
  } catch (error) {
    throw new Error('Error al actualizar la cantidad de producto en el carrito');
  }
}

async function removeCartProduct(cid, pid, quantity) {
  try {
    const cart = await cartModel.findById(cid);
  
    if (!cart) {
        return res.status(404).json({ error: "Carrito no encontrado" });
    }
  
    const productIndex = cart.products.findIndex((item) => item.product.toString() === pid);
    
    
    if (productIndex === -1) {
        return res.status(404).json({ error: "Producto no encontrado en el carrito" });
    }

    cart.products.splice(productIndex, 1);
    const updatedCart = await cartModel.findByIdAndUpdate(cid, cart, { new: true });

    const product = await productModel.findById(pid)
    product.stock += parseInt(quantity);

    return { message: 'El producto fue eliminado' };
  } catch (error) {
    console.log(error)

  }
}

async function deleteCart(cid) {
  try {
    const cart = await cartModel.findById(cid);
    
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    
    cart.products.map(async (product) => {
      const item = await productModel.findById(product.product._id);
      item.stock += product.quantity;
      item.save();
    });

    cart.products = [];
    await cart.save();
  } catch (error) {
    throw new Error('Error al eliminar vaciar del carrito');
  }
}






module.exports = {
  createCart,
  getAllCarts,
  getCart,
  addToCart,
  updateCartProduct,
  removeCartProduct,
  deleteCart,
};