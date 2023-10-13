'use strict'

const _ = require('lodash')
const {Types} = require('mongoose')

const convertStringIdToObjectId = id => new Types.ObjectId(id)
const getInfoData = ({fields = [], object = {}}) => {
    return _.pick(object, fields)
}


/**
 * ['a', 'b'] => {a: 1, b: 1}
 */
const convertSelectToObject = (select = []) => {
    return Object.fromEntries(select.map(item => [item, 1]));
}

const convertUnSelectToObject = (select = []) => {
    return Object.fromEntries(select.map(item => [item, 0]));
}

const removeInvalidValue = object => {
    Object.keys(object).forEach(key => {
        if (object[key] === undefined || object[key] == null) {
            delete object[key]
        }
    })

    return object;
}

/**
 Giả sử có 1 object với object khác lồng nhau:

 const a = {
 c: {
 d: 1,
 e: 1
 }
 }

 Khi update, nó sẽ hiểu c là 1 value
 ví dụ từ FE truyền vào:
 a = {
 c: {
 d: 2,
 }
 }

 thì nó sẽ làm
 db.collection.updateOne({
 c: {d:2},
 })

 thì kết quả của a sau khi update sẽ là:
 a = {
 c: {
 d: 2,
 }
 }

 Nếu ta vết hàm dưới đây, thì nó sẽ convert lại thành:
 db.collection.updateOne({
 `c.d`: 1,
 })

 thì kết quả của a sau khi update sẽ là:
 a = {
 c: {
 d: 2,
 e: 1
 }
 }

 --> Tác Dụng: Dù FE truyền thiếu vẫn không sao
 **/

const updateNestedObjectParser = object => {
    const finalObject = {};
    Object.keys(object).forEach(key => {
        if (typeof object[key] === 'object' && !Array.isArray(object[key])) {
            const response = updateNestedObjectParser(object[key]);
            Object.keys(response).forEach(subKey => {
                finalObject[`${key}.${subKey}`] = response[subKey];
            });
        } else {
            finalObject[key] = object[key];
        }


    })

    return finalObject;
}

module.exports = {
    getInfoData,
    convertSelectToObject,
    convertUnSelectToObject,
    removeInvalidValue,
    updateNestedObjectParser,
    convertStringIdToObjectId
}
