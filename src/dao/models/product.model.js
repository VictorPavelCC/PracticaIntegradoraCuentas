const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const productCollection = "products"

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "users"},
})
productSchema.plugin(mongoosePaginate)

const productModel = mongoose.model(productCollection, productSchema)

module.exports = { productModel }