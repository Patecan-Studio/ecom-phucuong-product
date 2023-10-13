'use strict'


const eComStatusCode = require("../statusCode/eComStatusCode");

class SuccessResponse {
    constructor({message, statusCode = eComStatusCode.StatusCodes.OK, reasonStatusCode = eComStatusCode.ReasonPhrases.OK, metadata = {}}) {
        this.status = statusCode;
        this.message = message?? reasonStatusCode ;
        this.metadata = metadata;
    }

    send(res, headers = {}){
        return res.status(this.status).json(this);
    }
}

class OkResponse extends SuccessResponse{
    constructor({message, metadata, option}){
        super({message, metadata, option});
    }
}

class CreatedResponse extends SuccessResponse{
    constructor({message, metadata, option}) {
        super({message, statusCode: eComStatusCode.StatusCodes.CREATED, reasonStatusCode: eComStatusCode.ReasonPhrases.CREATED, metadata, option});
    }
}

class AuthSuccessResponse extends SuccessResponse{
    constructor({message, metadata, option}) {
        super({message, statusCode: eComStatusCode.StatusCodes.OK, reasonStatusCode: eComStatusCode.ReasonPhrases.OK, metadata, option});
    }
}

module.exports = {
    SuccessResponse,
    OkResponse,
    CreatedResponse,
    AuthSuccessResponse
}
