"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// read the .env file if dev environment
if (process.env.NODE_ENV !== "production") {
    const result = require("dotenv").config();
    console.log(result.parsed);
    if (result.error) {
        console.log("There was an error while reading the environment variables.");
        throw result.error;
    }
}
// requires this es5 syntax, because babel doesn't take care of this in producion
const config = {
    PORT: process.env.PORT,
    STRIPE_SK: process.env.STRIPE_SK,
    HOST_NAME: process.env.HOST_NAME // example hostname "localhost"
};
exports.default = config;
