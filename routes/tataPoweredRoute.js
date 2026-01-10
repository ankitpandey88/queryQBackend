
const express = require("express");

const {  getLogin } = require("../controllers/tataPoweredController");

const tataPoweredRoute = express.Router();


tataPoweredRoute.post("/login", getLogin);

module.exports = tataPoweredRoute;

 
 