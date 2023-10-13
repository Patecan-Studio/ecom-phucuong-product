'use strict'
const JWT = require('jsonwebtoken')
const {asyncErrorHandler} = require("../common/response/errorHandlerMiddleWare");
const {AuthFailureError, NotFoundError} = require("../common/response/error.response");
const KeyStoreService = require("../services/auth/keyStore.service");
const keyStoreModel = require('../models/keyStore.model');



const HEADER = {
    API_KEY: 'x-api-key', // -->We provide this API key to User, User must take this key to access API
    CLIENT_ID: 'x-client-id', // --> userId
    AUTHORIZATION: 'authorization', // --> accessToken
    REFRESH_TOKEN: 'x-rtoken-id', // --> refreshToken
}


/*
    --> From 1 Data is payload
        Generate accessToken using publicKey
        Generate refreshToken using privateKey

    --> To get back User Info
        Verify accessToken using publicKey
        Verify refreshToken using privateKey
 */
const createJWTPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: '1h',
        });

        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '1 day',
        })

        JWT.verify(accessToken, publicKey, (err, decode) => {
            if(err){
                console.log(`Error to Verify::`, err)
            } else {
                console.log(`Decoded::`, decode)
            }
        });

        return {accessToken, refreshToken}

    } catch (error) {
        return {
            code: 'xxx',
            message: `Cannot create token`,
            messageError: error.message,
        }
    }
}


const authenticate = asyncErrorHandler(async (req, res, next) => {
    /*
    * 1 - Check UserId missing?
    * 2 - Check accessToken missing?
    * 3 - Verify accessToken
    * 4 - Check accessToken expired?
    * 5 - Check User exists?
    * 6 - Check User is active?
    * 7 - Return OK
    * */

    // .1
    const userId = req.headers[HEADER.CLIENT_ID];
    if(!userId){
        throw new AuthFailureError('Invalid Request: Not found User Id')
    }

    // .2
    const keyStore = await KeyStoreService.findByUserId(userId);
    if(!keyStore){
        throw new NotFoundError('Invalid Request: : Not found Key Store')
    }
    console.log('publicKey', keyStore.publicKey)

    // .3
    if(req.headers[HEADER.REFRESH_TOKEN]){
        try{
            const refreshToken = req.headers[HEADER.REFRESH_TOKEN];
            const decodeUser = await JWT.verify(refreshToken, keyStore.privateKey);

            if(userId !== decodeUser.userId){
                throw new AuthFailureError('Invalid Request : Not found User Data')
            }

            // .5 Now we will pass any data that we need to use in the request payload that POST, PUT, PATCH to the API

            req.keyStore = keyStore;
            req.refreshToken = refreshToken;
            req.user = decodeUser;
            return next();
        } catch (e) {
            throw new AuthFailureError(e.message)
        }

    }


    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if(!userId){
        throw new AuthFailureError('Invalid Request : Not found Access Token')
    }
    console.log('accessToken', accessToken)

    // .4
    try{
        const decodeUser = await JWT.verify(accessToken, keyStore.publicKey);

        if(userId !== decodeUser.userId){
            throw new AuthFailureError('Invalid Request : Not found User Data')
        }

        // .5 Now we will pass any data that we need to use in the request payload that POST, PUT, PATCH to the API

        req.keyStore = keyStore;
        req.user = decodeUser;
        return next();
    } catch (e) {
        throw new AuthFailureError(e.message)
    }

});



const verifyPublicJWTPair = async (accessToken, publicKey) => {
    return await JWT.verify(accessToken, publicKey);
}

const verifyPrivateJWTPair = async (refreshToken, privateKey) => {
    return await JWT.verify(refreshToken, privateKey);
}

const deleteJWTPairByUserId = async (userId) => {
    return await keyStoreModel;
}

module.exports = {
    createJWTPair,
    verifyPublicJWTPair,
    verifyPrivateJWTPair,
    authenticate
}
