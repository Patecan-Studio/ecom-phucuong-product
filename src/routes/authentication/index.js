const express = require("express");
const accessController = require('../../controllers/authentication/authentication.controller')
const {asyncErrorHandler} = require("../../common/response/errorHandlerMiddleWare");
const {authenticate} = require("../../auth/jwtUtils");


const router = express.Router();


// SignUp
// This step doesn't have any key or JWT token
router.post("/shop/signup", asyncErrorHandler(accessController.signUp));

// This step is where we create JWT token, every times user login, we create new token pair
// From now, we will use JWT token to authenticate user for every other API
router.post("/shop/login", asyncErrorHandler(accessController.login));

// [ MIDDLEWARE ] Authenticate Token
router.use(authenticate);

router.post("/shop/logout", asyncErrorHandler(accessController.logout));
router.post("/shop/handlerRefreshToken", asyncErrorHandler(accessController.handlerRefreshToken));






module.exports = router
