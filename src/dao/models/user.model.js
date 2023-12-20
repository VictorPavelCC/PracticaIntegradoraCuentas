const mongoose = require("mongoose")
const userCollection = "users"

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  age: String,
  password: String,
  cart: { type: mongoose.Schema.Types.ObjectId, ref: "carts" },
  rol: { type: String, default: "user" },
  documents: [
    {
      name: {type: String},
      reference: {type: String},
    }
  ],
  last_connection: {type: Date},  
})
const userModel = mongoose.model(userCollection, userSchema)

module.exports = { userModel }