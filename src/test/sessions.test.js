const sessionDao = require('../dao/sessionsDao.js')
const assert = require('assert')
const chai = require('chai');
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const supertest = require('supertest');

dotenv.config()

const URL = process.env.MONGO_URL_TEST
const requester = supertest('http://localhost:8080');

describe('Testing Session', () => {
    const nuevoUser = {
        first_name: "John",
        last_name: "Ferz",
        email: "john.Ferz@example.com",
        age: 30,
        password: "password123",
        cart: {} 
    };
    it('POST: crea un User', async function(){
        
        try {
            const result = await requester.post('/api/sessions/register').send(nuevoUser);
            console.log(result.payload)
        } catch (error) {
            console.log("Error al Crear el User", error)
            assert.fail("Test de Post User Con Errores")
        } 

    })

    it('POST Login: Inicia la sesion ', async function(){
        
        try {
                const result = await requester.post('/api/sessions/').send({email: "john.Ferz@example.com", password: "password123"});
        } catch (error) {
            console.log("Error en el Login del User", error)
            assert.fail("Test Con Errores de login")
        }

    })

    it('GET Logout: Cierra la sesion del User',async function(){
        try {
            const result = await requester.get('/api/sessions/profile')
    } catch (error) {
        console.log("Error en el Logout del User", error)
        assert.fail("Test Con Errores de logout")
    }
    })





})