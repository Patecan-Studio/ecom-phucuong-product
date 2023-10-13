'use strict'
const AuthenticationService = require('../../services/auth/authentication.service');
const {CreatedResponse, AuthSuccessResponse, SuccessResponse} = require("../../common/response/success.response");

class AuthController {

    handlerRefreshToken = async (req, res, next) => {
        console.log(`req.user`, req.user)
        console.log(`req.keyStore`, req.keyStore)
        console.log(`req.refreshToken`, req.refreshToken)

        const result = await AuthenticationService.handleRefreshToken({
            refreshToken: req.refreshToken,
            user: req.user,
            keyStore: req.keyStore
        });
        new SuccessResponse({
            message: 'Get JWT Successfully',
            metadata: result,
            options: {}
        }).send(res);
    }

    login = async (req, res, next) => {
        const result = await AuthenticationService.login(req.body);
        new AuthSuccessResponse({
            message: 'Shop Login Successfully',
            metadata: result,
            options: {}
        }).send(res);
    }


    logout = async (req, res, next) => {
        /**
         * @keyStore: {userId, publicKey, privateKey, refreshToken} is attached to req by checkAuth middleware
         **/

        const result = await AuthenticationService.logout(req.keyStore);

        new SuccessResponse({
            message: 'Logout Successfully',
            metadata: result,
            options: {}
        }).send(res);
    }

    signUp = async (req, res, next) => {
        const result = await AuthenticationService.signUp(req.body);
        new CreatedResponse({
            message: 'Sign Up Shop Successfully',
            metadata: result,
            options: {}
        }).send(res);
    }
}

module.exports = new AuthController();
