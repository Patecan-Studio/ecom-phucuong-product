'use strict';


const express = require("express");
const inventoryController = require('../../controllers/inventory.controller');
const {asyncErrorHandler} = require("../../common/response/errorHandlerMiddleWare");
const {authenticate} = require("../../auth/jwtUtils");


const router = express.Router();



router.use(authenticate);

router.post('/', asyncErrorHandler(inventoryController.addStockToInventory));

module.exports = router;

