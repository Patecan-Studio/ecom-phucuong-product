

'use strict'

const keyStoreModel = require('../../models/keyStore.model');
const mongoose = require('mongoose');

class KeyStoreService {

    static saveKeys = async ({userId, publicKey, privateKey, refreshToken}) => {
        try {
            // const key = await keyTokenModel.create({
            //     userId,
            //     publicKey: publicKey.toString(),
            //     privateKey: privateKey.toString()
            // });
            //
            // return key ? key : null

            const filter = {userId: userId};
            const update = {
                publicKey,
                privateKey,
                refreshTokensUsed: [],
                refreshToken
            };
            const options = {upsert: true, new: true};

            const tokens = await keyStoreModel.findOneAndUpdate(filter, update, options)

            return tokens ? tokens.publicKey : null

        } catch (error) {
            return {
                code: 'xxx',
                message: `Cannot create token`,
                messageError: error.message,
            }
        }
    }


    static findByUserId = async (userId) => {
        const key = await keyStoreModel.findOne({ userId}).lean();
        return key;
    }


    static removeKeyStoreById = async (id) => {
        return await keyStoreModel.findByIdAndRemove(id);
    }

    static removeKeyStoreByUserId = async (userId) => {
        return await keyStoreModel.findOneAndRemove({userId});
    }

    static findByRefreshTokensUsed = async (refreshToken) => {
        return await keyStoreModel.findOne({refreshTokensUsed: refreshToken}).lean();
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keyStoreModel.findOne({refreshToken}).lean();
    }

}

module.exports = KeyStoreService
