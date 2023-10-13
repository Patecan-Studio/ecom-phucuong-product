const {findById} = require("../services/auth/apiKey.service");


const HEADER_ATTR = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization'
}

const checkApiKey = async (req, res, next) => {
    try {
        const key = req.headers[HEADER_ATTR.API_KEY?.toString()];
        if(!key){
            return res.status(401).json({
                code: 401,
                message: 'Forbidden Error: api-key is required'
            })
        }

        const objKey = await findById(key);
        if(!objKey){
            return res.status(401).json({
                code: 401,
                message: 'Forbidden Error: Wrong key'
            })
        }

        req.objKey = objKey;
        return next();

    } catch (error) {

    }
}

const checkPermission = (permission) => {

    return (req, res, next) => {
        if(!req.objKey.permissions){
            return res.status(403).json({
                code: 403,
                message: 'Permission Denied'
            })
        }

        const validPermission = req.objKey.permissions.includes(permission);
        if(!validPermission){
            return res.status(403).json({
                code: 403,
                message: 'Permission Denied'
            })
        }

        return next();
    }

}


module.exports = {
    checkApiKey,
    checkPermission
}
