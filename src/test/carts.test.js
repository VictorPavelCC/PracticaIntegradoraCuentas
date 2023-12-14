const cartDao = require('../dao/cartDao')
const assert = require('assert')
const chai = require('chai');
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const { pid } = require('process');
const supertest = require('supertest');

dotenv.config()

const URL = process.env.MONGO_URL_TEST
const requester = supertest('http://localhost:8080');
const expect = chai.expect;

describe('Testing Carts',() => {
    before(function () {
        mongoose.connect(URL,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
          }).then(() => { console.log('Base de Datos Conectada'); done() })
        
        this.timeout(1000)
    })
    it('Crea Un Carrito', async function(){
        this.timeout(2000)


        
        try {
            let result = await cartDao.createCart();

            assert.ok(result); //carrito creado
            assert.strictEqual(result.products.length, 0); // El carrito debería estar vacío al inicio
            
        } catch (error) {
            console.log("Error al obtener Cart", error)
            assert.fail("Test Con Errores")
        }

    })
    const productId= '65775a2e7d394b4bde1ed0b0'
    const CartId = '65785d22bde03e575e81a91e' //
    const CartID2 = '657a7ebe514d3a92d56a5b22'
    it('GET Obtiene todos los Carritos', async function(){
        this.timeout(5000)
        try {
            let result = await requester.get('/api/carts/')
            
            expect(result.status).to.be.eql(200);
            assert.strictEqual(Array.isArray(result.body.payload) && result.body.payload.length>0, true)
        } catch (error) {
            console.log("Error en el Get Carritos", error)
            assert.fail("Test Con Errores")
        }




    })
    it('GET Obtiene Un Carrito', async function(){
        this.timeout(5000)

        try {
            let result = await requester.get(`/api/carts/${CartID2}`)    
            expect(result.statusCode).to.be.eql(200);

        } catch (error) {
            console.log("Error al obtener Carrito", error)
            assert.fail("Test Con Errores")
        }
    })
    it('PUT Modifica Un Carrito (añade producto)', async function(){
        this.timeout(8000)

        try {
            //const result = await requester.put(`/api/carts/${CartId}`).send({productId})    
            let result = await cartDao.addToCart(CartId,productId)            
            assert.deepStrictEqual(result, { message: 'producto Añadido al Carrito' });
            
        } catch (error) {
            console.log("Error en el Al añadir Producto", error)
            assert.fail("Test Con Errores")
        }
    })
    it('PUT Modifica El Carrito (elimina un producto)', async function(){


        try {
            let result = await cartDao.removeCartProduct(CartId,productId,1)
            //const result = await requester.put(`/${CartId}/products/${productId}`)
            assert.deepStrictEqual(result, { message: 'El producto fue eliminado' });
        } catch (error) {
            console.log("Error en el Eliminar product", error)
            assert.fail("Test Con Errores")
        }
    })




})