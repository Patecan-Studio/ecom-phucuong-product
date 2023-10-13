'use strict'

const InventoryService = require("../services/inventory/inventory.service");
const {BadRequestError} = require("../common/response/error.response");
const {SuccessResponse} = require("../common/response/success.response");


class InventoryController {
    addStockToInventory = async (req, res, next) => {
        const result = await InventoryService.addStockToInventory(req.body);

        new SuccessResponse({
            message: "Add stock to inventory successfully",
            metadata: result
        }).send(res);
    }
}

module.exports = new InventoryController();
