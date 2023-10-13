'use strict'

const shopModel = require('../../models/shop.model')
const keyTokenModel = require('../../models/keyStore.model')
const byCrypt = require('bcrypt')
const crypto = require('crypto')
const KeyStoreService = require("./keyStore.service");
const {createJWTPair, verifyPrivateJWTPair} = require("../../auth/jwtUtils");
const {getInfoData} = require("../../utils");
const {BadRequestError, ForbiddenError} = require("../../common/response/error.response");
const ShopService = require("../shop.service");
const {removeKey} = require("./keyStore.service");
const ApiKeyService = require("./apiKey.service");
const {findByEmail} = require("../shop.service");


const RoleShopEnum = {
    ADMIN: '000',
    SHOP: '001',
    WRITER: '002',
    EDITOR: '003'
}

class AuthenticationService {

    /**
     * --> Check if RefreshToken is already used
     * @param user
     * @param keyStore
     * @param refreshToken
     * @returns {Promise<void>}
     */
    static handleRefreshToken = async ({keyStore, user,refreshToken}) => {
        /**
           @RULE 1: RefreshToken can only used once for re-generate Access Token, if it used twice, it must be someone stole that RefreshToken
         **/
        const {userId, email} = user;

        if(keyStore.refreshTokensUsed.includes(refreshToken)){
            await KeyStoreService.removeKeyStoreByUserId(userId);
            throw new ForbiddenError('#1 Suspicious activity detected, please login again');
        }

        if(keyStore.refreshToken !== refreshToken){
            throw new ForbiddenError('#2 Suspicious activity detected, please login again');
        }
        const foundShop = await findByEmail(email);
        if(!foundShop){
            throw new ForbiddenError('foundShop Suspicious activity detected, please login again');
        }

        /**
         @RULE 3: If everything right, we update new JWT Token Pair using existed Key Pair
         */
        const newJWTPair = await createJWTPair({userId, email}, keyStore.publicKey, keyStore.privateKey);

        await keyTokenModel.updateOne({
            userId: userId
        },{
            $set: {
                refreshToken: newJWTPair.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken // --> This Refresh Token is now expired
            }
        });

        return {
            user,
            newJWTPair
        }






        //
        //
        //
        // const foundToken = await KeyStoreService.findByRefreshTokensUsed(refreshToken);
        // if(foundToken){
        //     const {userId, email} = await verifyPrivateJWTPair(refreshToken, foundToken.privateKey);
        //     if(userId){
        //         await KeyStoreService.removeKeyStoreByUserId(userId);
        //         throw new ForbiddenError('userId Suspicious activity detected, please login again');
        //     }
        // }
        //
        // /**
        //   @RULE 2: Check if this RefreshToken exist, if not, it must be someone create fake RefreshToken
        //  */
        // const holderToken = await KeyStoreService.findByRefreshToken(refreshToken);
        // if(!holderToken){
        //     throw new ForbiddenError('holderToken Suspicious activity detected, please login again');
        // }
        //
        // // --> Verify RefreshToken
        // const {userId, email} = await verifyPrivateJWTPair(refreshToken, holderToken.privateKey);
        // console.log(email);


    }


    static logout = async (keyStore) => {
        const removedKey = await KeyStoreService.removeKeyStoreById(keyStore._id);

        return removedKey;
    }

    /*
        1 - Check Email in Database
        2 - Compare Password
        3 - Create new key pair
        4 - Generate Token Pair from key pair and update to Database
        5 - Get Data return to Client
     */
    static login = async ({email, password, refreshToken = null}) => {
        // .1
        const foundShop = await ShopService.findByEmail(email);
        if (!foundShop) {
            throw new BadRequestError('Error: Shop not exists');
        }

        // .2
        const isMatch = await byCrypt.compare(
            password,
            foundShop.password // --> This is Hashed Password by Salt, not relate to JWT Token
        );

        if (!isMatch) {
            throw new BadRequestError('Error: Password is incorrect');
        }

        // .3
        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');


        // .4
        const tokenPair = await createJWTPair({userId: foundShop._id, email}, publicKey, privateKey);

        await KeyStoreService.saveKeys({
            userId: foundShop._id,
            privateKey: privateKey,
            publicKey: publicKey,
            refreshToken: tokenPair.refreshToken
        });


        // .5
        return {
            shop: getInfoData({fields: ['_id', 'name', 'email'], object: foundShop}),
            tokenPair
        }


    }


    static signUp = async ({name, email, password}) => {

        const shop = await shopModel.findOne({email}).lean()

        if (shop) {
            throw new BadRequestError('Error: Shop already exists');
        }

        /**
         * --> Hash Password: This is Hashed Password by Salt, not relate to JWT Token
         * Hacker go to database, they can't see the password
         * @Salt: A random string added to the password before hashing to make it more secure
         **/
        const passwordHash = await byCrypt.hash(password, 10)
        const newShop = await shopModel.create({name, email, password: passwordHash, roles: RoleShopEnum.SHOP})


        if (newShop) {
            /**
             * --> Create Private-Key, Public-Key
             * @Private-Key (Kept by User): Used to create JWT Access Token & Refresh Token
             * @Public-Key (Kept by Server): Used to verify JWT token --> into User Data
             * */
                // const { privateKey, publicKey  } = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     },
                //     privateKeyEncoding: {
                //         type: 'pkcs1',
                //         format: 'pem'
                //     }
                // });

            const privateKey = crypto.randomBytes(64).toString('hex');
            const publicKey = crypto.randomBytes(64).toString('hex');


            console.log({privateKey, publicKey});

            // --> Save Public-Key to Database
            // Refresher Token is not yet created
            const keyPair = await KeyStoreService.saveKeys({
                userId: newShop._id,
                publicKey,
                privateKey
            });

            console.log(`Created Public Key Success::`, publicKey)

            if (!keyPair) {
                return {
                    code: 'xxx',
                    message: 'Cannot create token',
                    status: 'error'
                }
            }


            // --> Create JWT Token Pair
            /**
             * @Payload: User info will be encrypted into Access Token
             *
             *
             **/
            const tokenPair = await createJWTPair({userId: newShop._id, email}, publicKey, privateKey);
            console.log(`Created Token Success::`, tokenPair)

            return {
                code: 201,
                metadata: {
                    shop: getInfoData({fields: ['_id', 'name', 'email'], object: newShop}),
                    tokenPair
                }
            }
        }

    }

}

module.exports = AuthenticationService
