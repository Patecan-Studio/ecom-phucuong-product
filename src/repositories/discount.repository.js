'use strict'

const {discount} = require("../models/discount.model");
const {convertSelectToObject, convertUnSelectToObject} = require("../utils");




const findAllDiscountCodeWithUnSelect = async({
    limit = 50, page = 1, sort = 'ctime', filter, unSelect, model
}) =>{
    const skip = (page - 1) * limit;
    const sortBy =  sort === 'ctime' ? {_id: -1} : {_id: 1} ;
    const documents = await model
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(convertUnSelectToObject(unSelect))
        .lean()
        .exec();

    return documents;
}


const findAllDiscountCodeWithSelect = async({
                                              limit = 50, page = 1, sort = 'ctime', filter, select, model
                                          }) =>{
    const skip = (page - 1) * limit;
    const sortBy =  sort === 'ctime' ? {_id: -1} : {_id: 1} ;
    const documents = await model
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(convertSelectToObject(select))
        .lean()
        .exec();

    return documents;
}


const checkDiscountExisted = async (model, filter) => {
    const foundDiscount = await model.findOne(filter).lean();
    return foundDiscount;
}


module.exports = {
    findAllDiscountCodeWithUnSelect,
    findAllDiscountCodeWithSelect,
    checkDiscountExisted
}
