require('dotenv').config()
const compression = require('compression')
const express = require('express')
const morgan = require('morgan')
const {default: helmet} = require('helmet')
const router = require('./routes/index')


// custom defined
const {checkOverload} = require('./helpers/check.connectDatabase')


// START
const app = express()

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({extended: true})) // for parsing application/x-www-form-urlencoded

console.log(`Process`, process.env)

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());


// init db
require('./database/init.mongodb');
checkOverload()


// Routing
app.use('/', router)


/**
 * [ MIDDLEWARE ]--> This middleware will be called when API URL not found
 * NOTE: this is not error handler
 * */
app.use((req, res, next) => {
    const error = new Error('API Not found');
    error.status = 404;
    return next(error);
});



// --> Error handler
app.use((error, req, res, next) => {
    const statusCode = error.status || 500; // --> 500 is default Server status

    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        stack: error.stack,
        message: error.message || 'Internal Server Error'

    }); // --> Return error message


});


module.exports = app;
