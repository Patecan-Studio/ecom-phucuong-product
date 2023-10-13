'use strict'

const { model, Schema, Types } = require('mongoose')

const DOCUMENT_NAME = 'Key'
const COLLECTION_NAME = 'Keys'

const keyStoreSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Shop'
    },
    publicKey: { // --> publicKey used for JWT to verify accessToken
        // after verify, we can get user info
        type: String,
        required: true,
        trim: true
    },
    privateKey: {
        type: String,
        required: true,
        trim: true
    },

    refreshTokensUsed: {  // --> refreshToken used to create new accessToken, accessToken is encrypted user info
        // Server use accessToken to verify user
        type: Array,
        default: []
    },
    refreshToken: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});


module.exports = model(DOCUMENT_NAME, keyStoreSchema)
