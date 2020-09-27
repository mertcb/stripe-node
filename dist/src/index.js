"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// module imports
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
// custom imports
const config_1 = require("../config");
//import routes
const index_1 = require("./routes/index");
// initialize express app
const app = express();
// crate an http server
// use helmet to add security headers and set x-powered-by to PHP
app.use(helmet.hidePoweredBy({ setTo: "PHP 4.2.0" }));
// use cors to enable CORS
app.use(cors());
// use morgan as a logger
app.use(morgan("dev"));
// use bodyparser to handle post requests
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
// set the server port
app.set("port", config_1.default.PORT || 3000);
// use the routes from the routes folder
app.use(index_1.default);
// error handlers
// not found error
app.use((req, res, next) => {
    const error = new Error("That endpoint doesn't exist. Route not found");
    next(error);
});
// development error handler
// will print stacktrace
if (process.env.NODE_ENV !== "production") {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    });
});
if (process.env.NODE_ENV !== "production") {
    // start the server in production
    app.listen(app.get("port"), config_1.default.HOST_NAME, () => {
        console.log(`Node app is running on ${config_1.default.HOST_NAME}:${config_1.default.PORT}`);
    });
}
else {
    // start the server in production
    app.listen(app.get("port"), () => {
        console.log("Node app is running on port", app.get("port"));
    });
}
exports.default = app;
