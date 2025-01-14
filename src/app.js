const express = require('express');
const morgan = require('morgan');
const {default: helmet} = require('helmet');
const compression = require('compression');
const app = express();

//init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

//init db

//init router
app.get('/', (req, res, next)=>{
    const strCompress = "hello world";

    return res.status(200).json({
        message: 'Welcome ',
        metadata: strCompress.repeat(1000)
    })
})
// handling error

module.exports = app;