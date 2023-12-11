const productDao = require('../dao/productsDao.js')
const assert = require('assert')
const chai = require('chai');
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const supertest = require('supertest');

dotenv.config()

const URL = process.env.MONGO_URL_TEST


const expect = chai.expect;
const requester = supertest('http://localhost:8080');
describe('Testing Products',() => {
    before(function () {
        mongoose.connect(URL).then(() => { console.log('Base de Datos Conectada'); done() })
        
        this.timeout(1000)
    })


    const newProduct = {
        name: 'Producto de Prueba2',
        category: 'prueba',
        price: 666,
        stock: 66,
        image: 'otro.png'
    };
    it( 'Obtiene todos los Products', async function(){
        this.timeout(5000)

        try {
            const result = await productDao.getAllProducts()
            //console.log(result)
            assert.strictEqual(Array.isArray(result.docs) && result.docs.length>0, true)
        } catch (error) {
            console.log("Error al obtener los Products", error)
            assert.fail("Test Con Errores")
        } 
    })

    it( 'POST createProduct: Crea un producto ', async function(){
        this.timeout(5000)

        try {       
            const result = await requester.post('/api/products/manager/createProduct').send(newProduct)
            //const result = await productDao.postProduct(newProduct) Funciona
 
            console.log('product', result.body);
            //expect(response.status).to.equal(200);
            
        } catch (error) {
            console.log("Error al Crear el Product", error)
            assert.fail("Test de createProduct Con Errores")
        } 
    })



})