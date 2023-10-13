const apiKeyModel = require('../../models/apiKey.model');
const crypto = require("crypto");

const findById = async (key) => {

    const objKey = await apiKeyModel.findOne({key, status: true}).lean();
    return objKey;
}

const create = async () => {
    await apiKeyModel.create({key: crypto.randomBytes(64).toString('hex'), status: true, permissions: ['0000']});
}

module.exports = {
    findById
}
