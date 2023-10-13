const express = require("express");
const {checkApiKey, checkPermission} = require("../auth/checkAuth");
const router = express.Router();


// [ MIDDLEWARE ] Check JWT in API header
router.use(checkApiKey)

// [ MIDDLEWARE ] Check Authorization
router.use(checkPermission('0000'))


router.use('/v1/api/brand', require('./brand'))
router.use('/v1/api/category', require('./category'))
router.use('/v1/api/product', require('./product'))
router.use('/v1/api/discount', require('./discount'))
router.use('/v1/api/inventory', require('./inventory'))

router.use('/v1/api/cart', require('./cart'))
router.use('/v1/api/checkout', require('./checkout'))
router.use('/v1/api', require('./authentication'))





module.exports = router
