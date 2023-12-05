const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const mongoose = require('mongoose')
const path = require('path')
const handlebars = require('express-handlebars')
const sessionRouter = require('./routes/sessions.router')
const cartRouter = require("./routes/carts.router")
const productRouter = require("./routes/products.router")
const mockingRouter = require("./routes/mocks.router")
const userRouter = require('./routes/user.router')
const errorHandler = require("./middleware/errors/errorHandler")
const passport = require('passport')
const logger = require ('./utils/logger')
const initializePassport = require('./config/passport.config')
const config = require("./config/config")

//swagger
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUiExpress = require('swagger-ui-express')


const app = express()
const PORT = 8080

app.engine("handlebars", handlebars.engine())
app.set("views", path.join(__dirname, 'views'))
app.set("view engine", "handlebars")


app.listen(PORT, () => {
    logger.info(`Servidor is running on port ${PORT}`)
})


mongoose.connect(config.mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    logger.info("Connected to Mongo Atlas DB");
  })
.catch((error) => {
    logger.error(error);
  });

app.use(session({
    store: MongoStore.create({
        mongoUrl: config.mongoUrl,
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        ttl: 1000
    }),
    secret: config.privateKey,
    resave: false,
    saveUninitialized: false
}))






initializePassport();
app.use(passport.initialize())
app.use(passport.session())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//swagger Options

const swaggerOptions = {
    definition : {
        openapi: '3.1.0',
        info: {
            title: "Ecommerce Pavel",
            description: "API en base a un ecommerce by me"
        },
    },
    apis:['src/docs/*.yaml']
}

//Swagger
const specs = swaggerJsDoc(swaggerOptions)
app.use('/apidocs',swaggerUiExpress.serve, swaggerUiExpress.setup(specs))

app.use("/api/sessions/", sessionRouter)
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);  
app.use("/api/users/", userRouter);
app.use("/api/mockingproducts", mockingRouter);
app.use(errorHandler);
